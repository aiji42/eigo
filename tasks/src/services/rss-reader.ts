import { fetchAndParseRSS } from '../libs/rss';
import { Service } from './service';
import * as schema from '../../../src/schema';

export class RssReader extends Service<number> {
	async perform(ruleId: number) {
		const rule = await this.db.query.absorbRules.findFirst({ where: (record, { eq }) => eq(record.id, ruleId) });
		if (!rule) throw new Error('rule not found');

		const feed = await fetchAndParseRSS(rule.url);

		const {
			channel: { title, link, image, lastBuildDate },
		} = feed;
		const lastUpdatedAt = lastBuildDate ? new Date(lastBuildDate) : new Date();

		const [channel] = await this.db
			.insert(schema.channels)
			.values({
				absorbRuleId: rule.id,
				title,
				url: link,
				thumbnailUrl: image?.url ?? null,
				lastUpdatedAt,
			})
			.onConflictDoUpdate({
				target: schema.channels.url,
				set: {
					lastUpdatedAt,
				},
			})
			.returning();

		await Promise.all(
			feed.items.map(async (item) => {
				const existing = await this.db.query.entries
					.findFirst({ where: (record, { eq }) => eq(record.url, item.link) })
					.then((res) => !!res);

				if (!existing) await this.env.KIRIBI.enqueue('SCRAPER', { channelId: channel.id, url: item.link });
			}),
		);
	}
}
