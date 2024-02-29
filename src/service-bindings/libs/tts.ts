import * as GoogleAuth from 'cloudflare-workers-and-google-oauth';
import { base64ToUint8Array } from '../../libs/utils';
import { parseBuffer as mmParseBuffer } from 'music-metadata/lib/core';
import { TTSResponseData } from '../../libs/tts';

export const getGoogleToken = async (key: GoogleAuth.GoogleKey) => {
	const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
	const oauth = new GoogleAuth.default(key, scopes);
	const token = await oauth.getGoogleAuthToken();
	if (!token) throw new Error('Failed to get token');

	return token;
};

export const ttsByGoogle = async (token: string, text: string) => {
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

export const inspectDuration = async (audio: Uint8Array) => {
	const { format } = await mmParseBuffer(audio);
	return format.duration ?? -1;
};
