import { Hono } from 'hono';
import { renderToString } from 'react-dom/server';
import { Bindings } from './bindings';
import { apiEntry } from './routes/api/entry';
import { apiList } from './routes/api/list';
import { apiExtractPhrases } from './routes/api/extract-phrases';
import { playlist } from './routes/playlist';

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

app.route('/', playlist);

app.route('/api/entry', apiEntry);

app.route('/api/list', apiList);

app.route('/api/extract-phrases', apiExtractPhrases);

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
