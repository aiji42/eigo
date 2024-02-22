import GoogleAuth from 'cloudflare-workers-and-google-oauth';
import { getEntryById, paginateEntries } from './libs/db';
import { ttsWithCache } from './libs/tts';
import { createM3U } from './libs/m3u';
import { getAudioByCache } from './libs/kv';
import { Hono } from 'hono';
import { displayRelativeTime } from './libs/utils';

export type Bindings = {
	CACHE: KVNamespace;
	DB: D1Database;
	GOOGLE_AUTH: string;
};

const app = new Hono<{
	Bindings: Bindings;
}>();

const SPEAKING_RATE = 0.65;

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

	const audioData = await Promise.all(
		paragraphs.map((text) =>
			ttsWithCache(
				token,
				{
					text,
					speakingRate: SPEAKING_RATE,
				},
				c.env.CACHE,
			),
		),
	);

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

	const audioData = await Promise.all(
		paragraphs.map((text) =>
			ttsWithCache(
				token,
				{
					text,
					speakingRate: SPEAKING_RATE,
				},
				c.env.CACHE,
			),
		),
	);

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
							border-left: 4px solid #4CAF50;
							padding-left: 8px;
							background-color: #333;
						}
						h1 {
							font-size: 1.25em;
						}
						.publishdAt {
							color: #aaa;
							font-size: 0.8em;
						}
					</style>
					<title>${entry.title}</title>
					<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
				</head>
				<body>
					<input type="range" min="12" max="64" value="24" id="fontSize">
					<h1>${entry.title}</h1>
					<img src="${entry.thumbnailUrl}" alt="${entry.title}" width="100%">
					<p class="publishdAt">${displayRelativeTime(new Date(entry.publishedAt))} ago</p>
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


					if ('mediaSession' in navigator) {
						navigator.mediaSession.metadata = new MediaMetadata({
							title: '${entry.title}',
							artwork: [
								{ src: '${entry.thumbnailUrl}', sizes: '96x96', type: 'image/jpeg' },
								{ src: '${entry.thumbnailUrl}', sizes: '128x128', type: 'image/jpeg' }
							]
						});

						// 再生コントロールのハンドラを定義
						navigator.mediaSession.setActionHandler('play', () => {
							audio.play();
							// 再生に関連する追加のロジック
						});

						navigator.mediaSession.setActionHandler('pause', () => {
							audio.pause();
							// 一時停止に関連する追加のロジック
						});

						// 必要に応じて、他のアクションハンドラ（nexttrack, previoustrack, stopなど）を設定
					}

					// メディア要素にイベントリスナーを追加して、再生状態の変化をメディアセッションに反映
					audio.addEventListener('play', () => {
						navigator.mediaSession.playbackState = 'playing';
					});

					audio.addEventListener('pause', () => {
						navigator.mediaSession.playbackState = 'paused';
					});
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
							margin-bottom: 16px;
						}
						a {
							text-decoration: none;
							color: #fff;
						}
						p, h2 {
							margin: 0;
						}
						.flex {
							width: 100%;
							display: flex;
							justify-content: space-between;
							align-items: center;
							gap: 16px;
						}
						.flex img {
							width: 80px;
							height: 80px;
							object-fit: cover;
							border-radius: 10%;
						}
						.flex div {
							flex: 1;
							min-width: 0;
						}
						.flex h2 {
							font-size: 1rem;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						.flex p {
							margin-top: 8px;
							font-size: 0.8rem;
							color: #aaa;
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
									<div>
										<h2>${entry.title}</h2>
										<p>${displayRelativeTime(new Date(entry.publishedAt))} ago</p>
									</div>
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
