import { fetchAndParseRSS } from './libs/rss-parser';
import { scrapeContent } from './libs/scrape';
import { getAllRules, getEntryByUrl, insertEntry, upsertChannel } from './libs/db';
import { Ai } from '@cloudflare/ai';

interface Env {
	DB: D1Database;
	AI: any;
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
				const content = await scrapeContent(item.link, rule.rule.contentSelector, new Ai(env.AI));
				if (!content.length) continue;
				const entry = await insertEntry(env.DB, channel, item, content);
				console.log(entry);
			}
		}
	},

	async fetch() {
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
