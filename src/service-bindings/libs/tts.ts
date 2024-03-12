import { base64ToUint8Array } from '../../libs/utils';
import { parseBuffer as mmParseBuffer } from 'music-metadata/lib/core';

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

export const ttsByGoogle = async (token: string, text: string, voiceName: string) => {
	const body = {
		audioConfig: {
			audioEncoding: 'MP3_64_KBPS',
			effectsProfileId: ['headphone-class-device'],
			pitch: 1,
			speakingRate: 0.85,
		},
		input: {
			text,
		},
		voice: {
			languageCode: 'en-US',
			name: voiceName,
		},
	};

	const res = await fetch('https://us-central1-texttospeech.googleapis.com/v1beta1/text:synthesize', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) throw new Error(await res.text());

	const { audioContent } = (await res.json()) as TTSResponseData;

	return base64ToUint8Array(audioContent);
};

export const inspectDuration = async (audio: Uint8Array) => {
	const { format } = await mmParseBuffer(audio);
	return format.duration ?? -1;
};
