import { sha256 } from './libs/utils';
import { calibrateByOpenAI, CalibrateOption } from './libs/calibrate';

interface Env {
	CACHE: KVNamespace;
	OPEN_AI_API_KEY: string;
}

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

		if (!payload || typeof payload !== 'object' || !('text' in payload) || typeof payload.text !== 'string')
			return new Response('400 Bad Request', { status: 400 });

		const calibrateOption: CalibrateOption = {
			level: 'A1',
			maxWords: 300,
			minWords: 400,
		};

		const cacheKey = `calibrate:${await sha256(payload.text + JSON.stringify(calibrateOption))}`;
		const value = await env.CACHE.get(cacheKey);

		if (value) {
			console.log('cache hit');
			return new Response(value);
		}

		const calibrated = await calibrateByOpenAI(env.OPEN_AI_API_KEY, payload.text, calibrateOption);

		context.waitUntil(env.CACHE.put(cacheKey, calibrated));

		return new Response(calibrated);
	},
};
