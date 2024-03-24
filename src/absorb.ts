import { fetchAndParseRSS } from './libs/rss-parser';
import { scrapeContent } from './libs/scrape';
import {
	getAllCalibratedEntriesByEntryId,
	getAllRules,
	getEntryById,
	getEntryByUrl,
	insertEntry,
	updateCalibratedEntry,
	updateEntry,
	upsertChannel,
} from './libs/db';
import { generateFeaturedImg } from './service-bindings/libs/featuredImg';
import { joinSentences } from './libs/content';
import { putImageOnBucket } from './libs/image';

interface Env {
	DB: D1Database;
	OPEN_AI_API_KEY: string;
	BUCKET: R2Bucket;
	IMAGE_HOST_PREFIX: string;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const rules = await getAllRules(env.DB);
		for (const rule of rules) {
			const feed = await fetchAndParseRSS(rule.url);
			const channel = await upsertChannel(env.DB, rule, feed);
			if (!channel) continue;

			for (const item of feed.items) {
				const persistedEntry = await getEntryByUrl(env.DB, item.link);
				if (persistedEntry) continue;
				const content = await scrapeContent(item.link, rule.rule.contentSelector);
				// パラグラフが少ない場合は保存しない
				if (!content.length) continue;
				const entry = await insertEntry(env.DB, channel, item, content);

				const thumbnail = await generateFeaturedImg(env.OPEN_AI_API_KEY, [item.title, joinSentences(content[0])].join('\n'));
				const key = await putImageOnBucket(env.BUCKET, entry.id, thumbnail);
				const res = await updateEntry(env.DB, entry.id, { thumbnailUrl: `${env.IMAGE_HOST_PREFIX}${key}?digest=${new Date().getTime()}` });

				console.log(res);
			}
		}
	},

	async fetch(req: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(req.url);

		// featured imgの再生成
		if (url.pathname === '/api/regenerate-featured-img') {
			const entryId = url.searchParams.get('id');
			if (!entryId) return new Response('id is required', { status: 400 });

			const entry = await getEntryById(env.DB, Number(entryId));
			if (!entry) return new Response('entry not found', { status: 404 });

			const thumbnail = await generateFeaturedImg(env.OPEN_AI_API_KEY, [entry.title, joinSentences(entry.content[0])].join('\n'));
			const key = await putImageOnBucket(env.BUCKET, entry.id, thumbnail);
			const thumbnailUrl = `${env.IMAGE_HOST_PREFIX}${key}?digest=${new Date().getTime()}`;
			await updateEntry(env.DB, entry.id, { thumbnailUrl });
			const calibratedEntries = await getAllCalibratedEntriesByEntryId(env.DB, entry.id);
			await Promise.all(
				calibratedEntries.map(async (calibratedEntry) => {
					return updateCalibratedEntry(env.DB, calibratedEntry.id, { thumbnailUrl });
				}),
			);

			return new Response(`Updated: entry thumbnail (id: ${entry.id}) and ${calibratedEntries.length} calibrated entries`);
		}

		// テストの実行用のリンクが表示されているhtmlを返す
		return new Response(
			`
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Test</title>
			</head>
			<body>
				<a href="/__scheduled?cron=*+*+*+*+*">Run</a>
			</body>
			</html>
		`,
			{
				headers: {
					'content-type': 'text/html; charset=UTF-8',
				},
			},
		);
	},
};
