import { sha256 } from './libs/utils';
import { translateByGoogle } from './libs/translate';
import { getGoogleToken } from './libs/api-token';

interface Env {
	CACHE: KVNamespace;
	GOOGLE_AUTH: string;
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

		const token = await getGoogleToken(JSON.parse(env.GOOGLE_AUTH));
		const cacheKey = `translate:${await sha256(payload.text)}`;
		const value = await env.CACHE.get(cacheKey);

		if (value) return new Response(value);

		const translated = await translateByGoogle(token, payload.text);

		context.waitUntil(env.CACHE.put(cacheKey, translated));

		return new Response(translated);
	},
};
