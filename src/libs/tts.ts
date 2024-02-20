import * as mm from 'music-metadata-browser';
import { base64ToUint8Array, sha256 } from './utils';

export type TTSResponseData = {
	audioContent: string;
	timepoints: {
		markName: string;
		timeSeconds: number;
	}[];
	audioConfig: {
		audioEncoding: string;
		speakingRate: number;
		pitch: number;
		volumeGainDb: number;
		sampleRateHertz: number;
		effectsProfileId: string[];
	};
};

export const ttsWithCache = async (
	token: string,
	{ text, speakingRate = 1, pitch = 0 }: { text: string; speakingRate?: number; pitch?: number },
	cache: KVNamespace,
) => {
	const body = {
		audioConfig: {
			audioEncoding: 'MP3',
			effectsProfileId: ['headphone-class-device'],
			pitch,
			speakingRate,
		},
		input: {
			text,
		},
		voice: {
			languageCode: 'en-US',
			name: 'en-US-Studio-O',
		},
	};

	// TTSのAPIを叩く前にKVにキャッシュがあるか確認
	const cacheKey = await sha256(JSON.stringify(body));
	const cacheData = await cache.get<TTSResponseData>(cacheKey, 'json');
	let ttsData = cacheData;
	if (!cacheData) {
		const res = await fetch('https://us-central1-texttospeech.googleapis.com/v1beta1/text:synthesize', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) throw new Error(await res.text());

		const data = (await res.json()) as TTSResponseData;
		await cache.put(cacheKey, JSON.stringify(data));

		ttsData = data;
	}
	if (!ttsData) throw new Error('TTS API failed');

	const { audioContent } = ttsData;
	const duration = (await mm.parseBuffer(base64ToUint8Array(audioContent)).then((metadata) => metadata.format.duration)) ?? 0;

	return { key: cacheKey, text, duration };
};
