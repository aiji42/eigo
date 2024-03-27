import { getCalibratedEntryByEntryIdAndCefrLevel, getEntryById, updateCalibratedEntry, updateEntry } from './libs/db';
import { ttsContent } from './libs/tts';
import { Hono } from 'hono';
import { createExtractPhrases, createTTS, serviceBindingsMock } from './libs/service-bindings';
import { renderToString } from 'react-dom/server';
import { isTTSed, joinSentences } from './libs/content';
import { existsAudioOnBucket, putAudioOnBucket, createM3U } from './libs/audio';
import { isCEFRLevel } from './libs/utils';
import { Bindings } from './bindings';
import { apiEntry } from './routes/api/entry';
import { apiList } from './routes/api/list';
import { apiTranslate } from './routes/api/translate';

const app = new Hono<{
	Bindings: Bindings;
}>();

// MEMO: ローカルで開発するとき用のR2のエンドポイント
app.get('/local-r2-pr', async (c) => {
	if (import.meta.env.PROD) return c.notFound();
	const key = c.req.query('key');
	if (!key) return c.notFound();
	const data = await c.env.BUCKET.get(key);
	if (!data) return c.notFound();
	return new Response(await data.arrayBuffer(), {
		headers: { 'Content-Type': key.endsWith('webp') ? 'image/webp' : 'audio/mpeg', 'Content-Length': data.size.toString() },
	});
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

// TODO: PlayListの生成を共通化する
app.get('/:entryId/:level/playlist.m3u8', async (c) => {
	const id = c.req.param('entryId');
	const level = c.req.param('level');
	if (!isCEFRLevel(level)) return c.notFound();
	let calibratedEntry = await getCalibratedEntryByEntryIdAndCefrLevel(c.env.DB, Number(id), level);
	if (!calibratedEntry) return c.notFound();

	if (!isTTSed(calibratedEntry.content)) {
		const tts = createTTS(serviceBindingsMock(c.env).TTS, c.req.raw);
		const { newContent, audios } = await ttsContent(tts, calibratedEntry.content);
		await Promise.all(audios.map(async ({ audio, key, duration }) => putAudioOnBucket(c.env.BUCKET, id, key, audio, { duration })));
		calibratedEntry = await updateCalibratedEntry(c.env.DB, calibratedEntry.id, { content: newContent });
	} else {
		await Promise.all(
			calibratedEntry.content
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

	return new Response(createM3U(calibratedEntry), { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
});

app.route('/api/entry', apiEntry);

app.route('/api/list', apiList);

app.route('/api/translate', apiTranslate);

app.get('/api/extract-phrases/:entryId', async (c) => {
	const id = c.req.param('entryId');
	const level = c.req.query('level');

	let text = '';

	if (level && isCEFRLevel(level)) {
		const calibratedEntry = await getCalibratedEntryByEntryIdAndCefrLevel(c.env.DB, Number(id), level);
		if (!calibratedEntry) return c.notFound();

		text = calibratedEntry.content.flatMap(joinSentences).join('\n');
	} else {
		const entry = await getEntryById(c.env.DB, Number(id));
		if (!entry) return c.notFound();

		text = entry.content.flatMap(joinSentences).join('\n');
	}

	const extractPhrases = createExtractPhrases(serviceBindingsMock(c.env).Calibrate, c.req.raw.clone());
	const phrases = await extractPhrases({ text, type: 'extract-phrases' });

	return c.json(phrases);
});

app.get('*', (c) => {
	const loadingIconCode = [
		'1f393', // 🎓
		'1f30e', // 🌎
		'1faa9', // 🪩
		'1f52e', // 🔮
		'1f98e', // 🦎
		'1f422', // 🐢
		'1f37f', // 🍿
		'1f379', // 🍹
		'1f4a1', // 💡
	][Math.floor(Math.random() * 9)];
	return c.html(
		`<!DOCTYPE html>` +
			renderToString(
				<html lang="en">
					<head>
						<meta charSet="utf-8" />
						<meta content="width=device-width, initial-scale=1 viewport-fit=cover" name="viewport" />
						<meta name="apple-mobile-web-app-capable" content="yes" />
						<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
						<meta name="robots" content="noindex nofollow" />
						<link rel="manifest" href="/static/manifest.json" />
						<link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
						<link rel="icon" href="/static/favicon.ico" />
						<link rel="preconnect" href="https://fonts.gstatic.com" />
						<link
							rel="preload"
							href={`https://fonts.gstatic.com/s/e/notoemoji/latest/${loadingIconCode}/512.gif`}
							as="image"
							type="image/webp"
						/>
						<link
							rel="stylesheet"
							href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0"
						/>
						<script dangerouslySetInnerHTML={{ __html: `_loadingIconCode = '${loadingIconCode}'` }} />
						<title>Eigo</title>
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
					<body className="m-auto max-w-4xl bg-neutral-50 font-sans text-neutral-700 px-safe">
						<div id="root"></div>
					</body>
				</html>,
			),
	);
});

export default app;
