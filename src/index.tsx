import { getEntryById, getNextEntry, getPrevEntry, paginateEntries, updateEntry } from './libs/db';
import { ttsContent } from './libs/tts';
import { Hono } from 'hono';
import { createCalibrate, createTranslate, createTTS, serviceBindingsMock } from './libs/service-bindings';
import { renderToString } from 'react-dom/server';
import { createContent, isTTSed, joinSentences } from './libs/content';
import { existsAudioOnBucket, putAudioOnBucket, createM3U } from './libs/audio';

export type Bindings = {
	DB: D1Database;
	TTS: Fetcher;
	Translate: Fetcher;
	Calibrate: Fetcher;
	BUCKET: R2Bucket;
};

const app = new Hono<{
	Bindings: Bindings;
}>();

// MEMO: ローカルで開発するとき用のR2のエンドポイント
app.get('local-r2-pr', async (c) => {
	if (import.meta.env.PROD) return c.notFound();
	const key = c.req.query('key');
	if (!key) return c.notFound();
	const audio = await c.env.BUCKET.get(key);
	if (!audio) return c.notFound();
	return new Response(audio.body, { headers: { 'Content-Type': 'audio/mpeg' } });
});

// TODO: honoのRPCを使ってリファクタ
app.get('/:entryId/playlist.m3u8', async (c) => {
	const id = c.req.param('entryId');
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	if (!isTTSed(entry.content)) {
		const tts = createTTS(serviceBindingsMock(c.env).TTS, c.req.raw);
		const { newContent, audios } = await ttsContent(tts, entry.content);
		await Promise.all(audios.map(async ({ audio, key, duration }) => putAudioOnBucket(c.env.BUCKET, id, key, audio, { duration })));
		entry = await updateEntry(c.env.DB, entry.id, { content: newContent });
	} else {
		await Promise.all(
			entry.content
				.flatMap(({ sentences }) => sentences)
				.map(async ({ key, text }) => {
					if (!(await existsAudioOnBucket(c.env.BUCKET, id, key))) {
						const tts = createTTS(serviceBindingsMock(c.env).TTS, c.req.raw.clone());
						const { duration, audio } = await tts(text, true);
						await putAudioOnBucket(c.env.BUCKET, id, key, audio, { duration });
					}
				}),
		);
	}

	return new Response(createM3U(entry), { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
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
					<meta content="width=device-width, initial-scale=1 viewport-fit=cover" name="viewport" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
					<link rel="manifest" href="/static/manifest.json" />
					<link rel="apple-touch-icon" type="image/png" href="/static/apple-touch-icon-180x180.png" />
					<link rel="icon" type="image/png" href="/static/icon-192x192.png" />
					<title>eigo</title>
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
				<body className="m-auto max-w-4xl bg-neutral-950 p-2 text-slate-100 p-safe">
					<div id="root"></div>
				</body>
			</html>,
		),
	);
});

export default app;
