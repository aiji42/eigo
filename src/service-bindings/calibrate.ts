import { calibrateByOpenAI } from './libs/calibrate';
import { CEFRLevel } from '../schema';
import { assertCEFRLevel } from '../libs/utils';
import { extractPhrases } from './libs/extractPhrases';

interface Env {
	CACHE: KVNamespace;
	OPEN_AI_API_KEY: string;
}

export type Payload = {
	type: string;
};

export type CalibratePayload = Payload & {
	text: string;
	level: CEFRLevel;
	maxWords: number;
	minWords: number;
	type: 'calibrate';
};

export type ExtractPhrasesPayload = Payload & {
	text: string;
	type: 'extract-phrases';
};

export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {
		if (request.method !== 'POST')
			return new Response('405 Method Not Allowed', {
				status: 405,
				headers: {
					Allow: 'POST',
				},
			});

		const payload = await request.json();

		try {
			assertPayload(payload);
		} catch (e) {
			return new Response('400 Bad Request', { status: 400 });
		}

		if (payload.type === 'extract-phrases') {
			try {
				assertExtractPhrasesPayload(payload);
			} catch (e) {
				return new Response('400 Bad Request', { status: 400 });
			}
			const phrases = await extractPhrases(env.OPEN_AI_API_KEY, payload.text);
			return Response.json(phrases);
		}

		try {
			assertCalibratePayload(payload);
		} catch (e) {
			return new Response('400 Bad Request', { status: 400 });
		}

		const calibrated = await calibrateByOpenAI(env.OPEN_AI_API_KEY, payload.text, {
			level: payload.level,
			maxWords: payload.maxWords,
			minWords: payload.minWords,
		});

		return Response.json(calibrated);
	},
};

function assertPayload(payload: any): asserts payload is Payload {
	if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
	if (!('type' in payload) || typeof payload.type !== 'string') throw new Error('Invalid payload');
}

function assertCalibratePayload(payload: Payload): asserts payload is CalibratePayload {
	if (!('text' in payload) || typeof payload.text !== 'string') throw new Error('Invalid payload');
	if (!('level' in payload) || typeof payload.level !== 'string') throw new Error('Invalid payload');
	assertCEFRLevel(payload.level);
	if (!('maxWords' in payload) || typeof payload.maxWords !== 'number') throw new Error('Invalid payload');
	if (!('minWords' in payload) || typeof payload.minWords !== 'number') throw new Error('Invalid payload');
}

function assertExtractPhrasesPayload(payload: Payload): asserts payload is ExtractPhrasesPayload {
	if (!('text' in payload) || typeof payload.text !== 'string') throw new Error('Invalid payload');
}
