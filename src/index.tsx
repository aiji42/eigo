import { getEntryById, getNextEntry, getPrevEntry, paginateEntries, updateEntry } from './libs/db';
import { ttsContent } from './libs/tts';
import { createM3U } from './libs/m3u';
import { Hono } from 'hono';
import { getAudio, putAudio } from './libs/kv';
import { createCalibrate, createTranslate, createTTS, serviceBindingsMock } from './libs/service-bindings';
import { renderToString } from 'react-dom/server';
import { createContent, isTTSed, joinSentences } from './libs/content';

export type Bindings = {
	CACHE: KVNamespace;
	DB: D1Database;
	TTS: Fetcher;
	Translate: Fetcher;
	Calibrate: Fetcher;
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
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	if (!isTTSed(entry.content)) {
		const tts = createTTS(serviceBindingsMock(c.env).TTS, c.req.raw);
		const { newContent, audios } = await ttsContent(tts, entry.content);
		// TODO: KVではなくR2にする
		await Promise.all(audios.map(async ({ audio, key }) => putAudio(c.env.CACHE, id, key, audio)));
		entry = await updateEntry(c.env.DB, entry.id, { content: newContent });
	}

	return new Response(createM3U(entry.content, `/audio/${entry.id}`), { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
});

app.get('/api/entry/:id', async (c) => {
	const id = c.req.param('id');
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	return c.json(entry);
});

app.get('/api/next-entry/:id', async (c) => {
	const id = c.req.param('id');
	let entry = await getNextEntry(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	return c.json(entry);
});

app.get('/api/prev-entry/:id', async (c) => {
	const id = c.req.param('id');
	let entry = await getPrevEntry(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	return c.json(entry);
});

app.get('/calibrate/:entryId', async (c) => {
	const id = c.req.param('entryId');
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	const calibre = createCalibrate(serviceBindingsMock(c.env).Calibrate, c.req.raw.clone());
	const calibrated = await calibre(entry.content.map(joinSentences).join('\n\n'));

	const paragraphs = calibrated.trim().split('\n').filter(Boolean);

	return c.json(await createContent(paragraphs));
});

app.get('/api/list', async (c) => {
	const offset = c.req.query('offset');
	const size = c.req.query('size');
	const entries = await paginateEntries(c.env.DB, size ? Number(size) : 10, offset ? Number(offset) : 0);

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
