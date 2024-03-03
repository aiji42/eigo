import { getEntryById, paginateEntries, updateEntry } from './libs/db';
import { ttsFromEntryWithCache } from './libs/tts';
import { createM3U } from './libs/m3u';
import { Hono } from 'hono';
import { getAudio, putAudio } from './libs/kv';
import { createTranslate, createTTS, serviceBindingsMock } from './libs/service-bindings';
import { renderToString } from 'react-dom/server';

export type Bindings = {
	CACHE: KVNamespace;
	DB: D1Database;
	TTS: Fetcher;
	Translate: Fetcher;
};

const app = new Hono<{
	Bindings: Bindings;
}>();

app.get('/audio/:entryId/:key/voice.mp3', async (c) => {
	const key = c.req.param('key');
	const id = c.req.param('entryId');
	const audio = await getAudio(c.env.CACHE, id, key);
	if (!audio) return c.notFound();
	return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } });
});

app.get('/playlist/:entryId/voice.m3u8', async (c) => {
	const id = c.req.param('entryId');
	const entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();
	// TODO: 404ではなく適切なステータスコードを返却
	if (!entry.isTTSed) return c.notFound();

	return new Response(createM3U(entry), { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
});

app.get('/api/entry/:id', async (c) => {
	const id = c.req.param('id');
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	if (!entry.isTTSed) {
		const tts = createTTS(serviceBindingsMock(c.env).TTS, c.req.raw);
		const { newContent, audios } = await ttsFromEntryWithCache(tts, entry);
		await Promise.all(audios.map(async ({ audio, key }) => putAudio(c.env.CACHE, id, key, audio)));
		entry = await updateEntry(c.env.DB, entry.id, { content: newContent, isTTSed: true });
	}

	return c.json(entry);
});

app.get('/api/list', async (c) => {
	const offset = c.req.query('offset');
	const entries = await paginateEntries(c.env.DB, 20, offset ? Number(offset) : 0);

	return c.json(entries);
});

app.post('/api/translate', async (c) => {
	const translate = createTranslate(serviceBindingsMock(c.env).Translate, c.req.raw.clone());

	const { text } = await c.req.json<{ text: string }>();
	if (!text) return new Response('400 Bad request', { status: 400 });

	return c.json({ translated: await translate(text, true) });
});

app.get('*', (c) => {
	return c.html(
		renderToString(
			<html>
				<head>
					<meta charSet="utf-8" />
					<meta content="width=device-width, initial-scale=1" name="viewport" />
					{import.meta.env.PROD ? (
						<>
							<script type="module" src="/static/client.__DIGEST__.js" />
							<link rel="stylesheet" href="/static/style.__DIGEST__.css" />
						</>
					) : (
						<>
							<script type="module" src="/src/client.tsx" />
							<link rel="stylesheet" href="/static/style.css" />
						</>
					)}
				</head>
				<body className="m-auto max-w-4xl bg-neutral-950 p-2 text-slate-100">
					<div id="root"></div>
				</body>
			</html>,
		),
	);
});

export default app;
