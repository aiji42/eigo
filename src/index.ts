import GoogleAuth from 'cloudflare-workers-and-google-oauth';
import { getEntryById, paginateEntries } from './libs/db';
import { ttsWithCache } from './libs/tts';
import { createM3U } from './libs/m3u';
import { getAudioByCache } from './libs/kv';
import { Hono } from 'hono';

export type Bindings = {
	CACHE: KVNamespace;
	DB: D1Database;
	GOOGLE_AUTH: string;
};

const app = new Hono<{
	Bindings: Bindings;
}>();

app.get('/audio/:key{.+\\.mp3}', async (c) => {
	const key = c.req.param('key').replace(/\.mp3$/, '');
	const audioData = await getAudioByCache(key, c.env.CACHE);
	return new Response(audioData, { headers: { 'Content-Type': 'audio/mpeg' } });
});

app.get('/playlist/:id{.+\\.m3u8}', async (c) => {
	const id = c.req.param('id').replace(/\.m3u8$/, '');
	const entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	const paragraphs = entry.content.split('\n');

	const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
	const oauth = new GoogleAuth(JSON.parse(c.env.GOOGLE_AUTH), scopes);
	const token = await oauth.getGoogleAuthToken();
	if (!token) throw new Error('Failed to get token');

	const audioData = await Promise.all(paragraphs.map((p) => ttsWithCache(token, p, c.env.CACHE)));

	return new Response(createM3U(audioData), { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
});

app.get('/:id', async (c) => {
	const id = c.req.param('id').replace(/\.m3u8$/, '');
	const entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	const paragraphs = entry.content.split('\n');

	const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
	const oauth = new GoogleAuth(JSON.parse(c.env.GOOGLE_AUTH), scopes);
	const token = await oauth.getGoogleAuthToken();
	if (!token) throw new Error('Failed to get token');

	const audioData = await Promise.all(paragraphs.map((p) => ttsWithCache(token, p, c.env.CACHE)));

	let duration = 0;
	return c.html(`<html>
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						body {
							background-color: #1e1e1e;
							color: #fff;
							padding: 8px;
						}
						p.active {
							/* 要素の左側に緑色のボーダーを表示する */
							/* ただし、他のpと左側を揃える */
							border-left: 4px solid #4CAF50;
							padding-left: 8px;
							background-color: #333;
						}
					</style>
					<title>VOA News</title>
					<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
				</head>
				<body>
					<input type="range" min="12" max="24" value="36" id="fontSize">
					<h1>${entry.title}</h1>
					<img src="${entry.thumbnailUrl}" alt="${entry.title}" width="100%">
					<p>${entry.publishedAt}</p>
					${audioData
						.map((audio) => {
							const start = duration;
							duration += audio.duration;
							return `<p data-offset="${start}" data-duration="${audio.duration}">${audio.text}</p>`;
						})
						.join('')}
					<audio src="/playlist/${id}.m3u8" controls autoplay id="audio"></audio>
					<script>
						const audio = document.getElementById('audio');
						// audioを画面の下部に固定
						audio.style.position = 'fixed';
						audio.style.bottom = 0;
						audio.style.left = 0;
						audio.style.width = '100%';

						if(Hls.isSupported()) {
							const hls = new Hls();
							hls.loadSource('/playlist/${id}.m3u8');
							hls.attachMedia(audio);
							hls.on(Hls.Events.MANIFEST_PARSED,function() {
								audio.play();
							});
						}
						else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
							audio.src = '/playlist/${id}.m3u8';
							audio.addEventListener('loadedmetadata',function() {
								audio.play();
							});
						}
						audio.addEventListener('timeupdate', function() {
							const currentTime = audio.currentTime;
							const parapraphs = document.querySelectorAll('p[data-offset]');
							for (const p of parapraphs) {
								const offset = parseFloat(p.dataset.offset);
								const duration = parseFloat(p.dataset.duration);
								if (offset <= currentTime && currentTime < offset + duration) {
									p.classList.add('active');
									const isInView = p.offsetTop < window.scrollY && window.scrollY < p.offsetTop + p.offsetHeight;
									if (!isInView) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
								} else {
									p.classList.remove('active');
								}
							}
						});


						const fontSize = document.getElementById('fontSize');
						const adjustFontSize = () => {
							const size = fontSize.value;
							document.body.style.fontSize = size + 'px';
						}
						fontSize.addEventListener('input', adjustFontSize);
						adjustFontSize();
					</script>
				</body>
			</html>`);
});

// リストページ
app.get('/', async (c) => {
	const offset = c.req.query('offset');
	const entries = await paginateEntries(c.env.DB, 20, offset ? Number(offset) : 0);
	return c.html(`<html>
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						body {
							background-color: #1e1e1e;
							color: #fff;
							padding: 8px;
						}
						ul {
							list-style-type: none;
							padding: 0;
						}
						li {
							margin-bottom: 8px;
						}
						a {
							text-decoration: none;
							color: #fff;
						}
						.flex {
							display: flex;
							justify-content: space-between;
							align-items: center;
							gap: 16px;
						}
						.flex img {
							width: 30%;
							height: 120px;
							object-fit: cover;
						}
						.flex h2 {
							font-size: 1.2rem;
						}
						.next {
							display: block;
							text-align: center;
							margin-top: 16px;
							color: #fff;
							text-decoration: none;
						}
					</style>
					<title>VOA News</title>
				</head>
				<body>
					<h1>VOA News</h1>
					<ul>
						${entries
							.map(
								(entry) => `<li>
							<a href="/${entry.id}">
								<div class="flex">
									<img src="${entry.thumbnailUrl}" alt="${entry.title}">
									<h2>${entry.title}</h2>
								</div>
							</a>
						</li>`,
							)
							.join('')}
					</ul>
          <!-- pagenation	-->
          <a class="next" href="/?offset=${Number(offset ?? 0) + 20}">Next</a>
				</body>
			</html>`);
});

export default app;
