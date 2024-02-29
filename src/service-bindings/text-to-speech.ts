import { getGoogleToken, inspectDuration, ttsByGoogle } from './libs/tts';
import { sha256 } from './libs/utils';

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
		const cacheKey = await sha256(payload.text);
		const { value, metadata } = await env.CACHE.getWithMetadata<{ duration: number }>(cacheKey, 'arrayBuffer');

		if (value && metadata)
			return new Response(value, {
				headers: {
					'X-Duration': String(metadata.duration),
				},
			});

		const audio = await ttsByGoogle(token, payload.text);
		const duration = await inspectDuration(audio);

		context.waitUntil(env.CACHE.put(cacheKey, audio, { metadata: { duration } }));

		return new Response(audio, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'X-Duration': String(duration),
			},
		});
	},
};
