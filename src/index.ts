import { getEntryById, paginateEntries, updateEntry } from './libs/db';
import { getGoogleToken, ttsFromEntryWithCache } from './libs/tts';
import { createM3U } from './libs/m3u';
import { Hono } from 'hono';
import { displayRelativeTime } from './libs/utils';
import { getAudio, putAudio } from './libs/kv';

export type Bindings = {
	CACHE: KVNamespace;
	DB: D1Database;
	GOOGLE_AUTH: string;
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

app.get('/:id', async (c) => {
	const id = c.req.param('id').replace(/\.m3u8$/, '');
	let entry = await getEntryById(c.env.DB, Number(id));
	if (!entry) return c.notFound();

	if (!entry.isTTSed) {
		const token = await getGoogleToken(JSON.parse(c.env.GOOGLE_AUTH));
		const { newContent, audios } = await ttsFromEntryWithCache(token, entry, c.env.CACHE);
		await Promise.all(audios.map(async ({ audio, key }) => putAudio(c.env.CACHE, id, key, audio)));
		entry = await updateEntry(c.env.DB, entry.id, { content: newContent, isTTSed: true });
	}

	return c.html(`<html>
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						body {
							background-color: #1e1e1e;
							color: #fff;
							padding: 4px;
							padding-bottom: 64px;
						}
						h1 {
							font-size: 1.25em;
							padding: 4px;
						}
						img {
							width: 100%;
						}
						p {
							padding: 8px;
							border-radius: 6px;
						}
						p.active {
						  scroll-margin-top: 64px;
							background-color: #333;
						}
						span.active {
						  background-color: rgb(33 150 243 / 50%);
						}
						p.translation {
							display: none;
						}
						.publishdAt {
							margin-top: 4px;
							padding: 4px;
							color: #aaa;
							font-size: 0.75em;
						}
						#audio {
							width: 100%;
							position: fixed;
							bottom: 0;
							left: 0;
						}
						.fontSize {
							display: none;
							justify-content: center;
							align-items: center;
							gap: 16px;
							font-size: 1.5rem;
							position: sticky;
							top: 0;
							background-color: #1e1e1e;
							padding: 8px 0;
						}
						.fontSize button {
							font-size: 2rem;
							padding: 0 8px;
							border: 0;
							background-color: #333;
							color: #fff;
							border-radius: 4px;
							width: 40px;
						}
					</style>
					<title>${entry.title}</title>
					<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
				</head>
				<body>
          <div class="fontSize">
						<button id="minus">-</button>
						<div id="magnification">100%</div>
          	<button id="plus">+</button>
					</div>
          <h1>${entry.title}</h1>
					<img src="${entry.thumbnailUrl}" alt="${entry.title}">
					<div class="publishdAt">${displayRelativeTime(entry.publishedAt)} ago</div>
					${entry?.content
						.map((p, i) => {
							return `<p class="original" data-translation="${p.key}" data-offset="${p.offset}" data-duration="${p.duration}">${p.sentences
								.map((span) => {
									return `<span data-offset="${span.offset}" data-duration="${span.duration}">${span.text}</span>`;
								})
								.join('')}</p><p class="translation" id="${p.key}" data-offset="${p.offset}" data-duration="${p.duration}">${p.sentences
								.map((span) => {
									return `<span data-offset="${span.offset}" data-duration="${span.duration}">${span.translation}</span>`;
								})
								.join('')}</p>`;
						})
						.join('')}
					<audio src="/playlist/${id}/voice.m3u8" controls autoplay id="audio"></audio>
					<script>
						let isTouch = false;
						window.addEventListener('touchstart', () => {
							isTouch = true;
						});
						window.addEventListener('touchend', () => {
							isTouch = false;
						})

						// スクロールしたらフォントサイズ変更ボタンを表示
						window.addEventListener('scroll', () => {
							const fontSize = document.querySelector('.fontSize');
							if (fontSize) {
								fontSize.style.display = window.scrollY > 100 ? 'flex' : 'none';
							}
						});
						const plus = document.getElementById('plus');
						const minus = document.getElementById('minus');
						// フォントサイズを変更するための関数
						const changeFontSize = (diff) => {
							const magnification = document.getElementById('magnification');
							const currentSize = parseInt(magnification.textContent, 10);
							const newSize = currentSize + diff;
							magnification.textContent = newSize + '%';
							document.body.style.fontSize = newSize + '%';
							// newSizeをlocalStorageに保存
							localStorage.setItem('fontSize', newSize);
						};
						// ボタンをクリックしたときの処理を登録
						plus.addEventListener('click', () => changeFontSize(10));
						minus.addEventListener('click', () => changeFontSize(-10));
						// localStorageからフォントサイズを取得
						const fontSize = localStorage.getItem('fontSize');
						if (fontSize) {
							document.body.style.fontSize = fontSize + '%';
							document.getElementById('magnification').textContent = fontSize + '%';
						}

						const audio = document.getElementById('audio');

						if(Hls.isSupported()) {
							const hls = new Hls();
							hls.loadSource('/playlist/${id}/voice.m3u8');
							hls.attachMedia(audio);
							hls.on(Hls.Events.MANIFEST_PARSED,function() {
								audio.play();
							});
						}
						else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
							audio.src = '/playlist/${id}/voice.m3u8';
							audio.addEventListener('loadedmetadata',function() {
								audio.play();
							});
						}
						audio.addEventListener('timeupdate', function() {
							const currentTime = audio.currentTime;
							const parapraphs = document.querySelectorAll('p[data-offset]');
							const sentences = document.querySelectorAll('span[data-offset]');
							for (const p of parapraphs) {
								const offset = parseFloat(p.dataset.offset);
								const duration = parseFloat(p.dataset.duration);
								if (currentTime　> 0 && offset <= currentTime && currentTime < offset + duration) {
									p.classList.add('active');
									const isInView = p.offsetTop < window.scrollY && window.scrollY < p.offsetTop + p.offsetHeight;
									if (!isInView && !isTouch) {
										p.scrollIntoView({ behavior: 'smooth', block: 'start' });
									}
								} else {
									p.classList.remove('active');
								}
							}
							for (const span of sentences) {
								const offset = parseFloat(span.dataset.offset);
								const duration = parseFloat(span.dataset.duration);
								if (currentTime　> 0 && offset <= currentTime && currentTime < offset + duration) {
									span.classList.add('active');
								} else {
									span.classList.remove('active');
								}
							}
						});

						if ('mediaSession' in navigator) {
							navigator.mediaSession.metadata = new MediaMetadata({
								title: '${entry.title}',
								artist: 'eigo',
								artwork: [
									{ src: '${entry.thumbnailUrl}', sizes: '96x96', type: 'image/jpeg' },
									{ src: '${entry.thumbnailUrl}', sizes: '128x128', type: 'image/jpeg' }
								]
							});

							navigator.mediaSession.setActionHandler('play', () => {
								audio.play();
							});
							navigator.mediaSession.setActionHandler('pause', () => {
								audio.pause();
							});
							navigator.mediaSession.setActionHandler('stop', () => {
								audio.stop();
							})
							navigator.mediaSession.setActionHandler('nexttrack', () => {
								// ページを送る
							})
							navigator.mediaSession.setActionHandler('previoustrack', () => {
								// ページを戻す
							})
						}
						// メディア要素にイベントリスナーを追加して、再生状態の変化をメディアセッションに反映
						audio.addEventListener('play', () => {
							navigator.mediaSession.playbackState = 'playing';
						});
						audio.addEventListener('pause', () => {
							navigator.mediaSession.playbackState = 'paused';
						});
						audio.addEventListener('ended', () => {
							navigator.mediaSession.playbackState = 'none';
						});

						// 翻訳と原文を切り替える(activeなもののみ)
						const originals = document.querySelectorAll('p.original');
						for (const p of originals) {
							p.addEventListener('click', () => {
								if (!p.classList.contains('active')) return;
								p.style.display = 'none';
								const translation = document.getElementById(p.dataset.translation);
								translation.style.display = 'block';
								audio.pause();
							});
						}
						const translation = document.querySelectorAll('p.translation');
						for (const p of translation) {
							p.addEventListener('click', () => {
								p.style.display = 'none';
								const original = document.querySelector('p[data-translation="' + p.id + '"]');
								original.style.display = 'block';
								audio.play();
							});
						}
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
										<p>${displayRelativeTime(entry.publishedAt)} ago</p>
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
