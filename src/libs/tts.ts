import * as mm from 'music-metadata-browser';
import { base64ToUint8Array, sha256 } from './utils';
import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';
import { Content, Paragraph, Sentence } from './scrape';
import { getAudio } from './kv';

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

export const getGoogleToken = async (key: GoogleKey) => {
	const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
	const oauth = new GoogleAuth(key, scopes);
	const token = await oauth.getGoogleAuthToken();
	if (!token) throw new Error('Failed to get token');

	return token;
};

export const ttsFromEntryWithCache = async (token: string, entry: InferSelectModel<typeof entries>, cache: KVNamespace) => {
	const sentences = entry.content.flatMap(({ sentences }) => sentences);
	const audios = await Promise.all(
		sentences.map(async (sentence) => {
			const storedAudio = await getAudio(cache, entry.id, sentence.key);
			const audio = storedAudio ? new Uint8Array(storedAudio) : await ttsByGoogle(token, sentence.text);
			const { format } = await mm.parseBuffer(audio);
			return { key: sentence.key, audio, duration: format.duration ?? 0 };
		}),
	);
	const mapping = Object.fromEntries(audios.map((data) => [data.key, data]));

	let offset = 0;
	const newContent = entry.content.map((paragraph) => {
		const sentences = paragraph.sentences.map((sentence) => {
			const duration = mapping[sentence.key].duration;
			const newSentence = {
				type: 'sentence',
				key: sentence.key,
				text: sentence.text,
				translation: sentence.translation,
				duration,
				offset,
			} satisfies Sentence;

			offset = offset + duration;

			return newSentence;
		});

		const duration = sentences.reduce((acc, { duration }) => acc + duration, 0);
		return {
			type: 'paragraph',
			key: paragraph.key,
			// newSentenceの計算でoffsetはすでに加算されてしまっている
			offset: offset - duration,
			duration,
			sentences,
		} satisfies Paragraph;
	}) satisfies Content;

	return { newContent, audios };
};

const ttsByGoogle = async (token: string, text: string) => {
	const body = {
		audioConfig: {
			audioEncoding: 'MP3',
			effectsProfileId: ['headphone-class-device'],
			pitch: 1,
			speakingRate: 0.65,
		},
		input: {
			text,
		},
		voice: {
			languageCode: 'en-US',
			name: 'en-US-Studio-O',
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
