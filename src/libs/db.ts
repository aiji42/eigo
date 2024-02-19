import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { RSSFeed, RSSItem } from './rss-parser';

export const getAllRules = async (d1: D1Database) => {
	const db = drizzle(d1, { schema });
	return db.query.absorbRules.findMany();
};

export const upsertChannel = async (d1: D1Database, rule: Awaited<ReturnType<typeof getAllRules>>[number], feed: RSSFeed) => {
	const {
		channel: { title, link, image, lastBuildDate },
	} = feed;
	const db = drizzle(d1, { schema });
	const result = await db
		.insert(schema.channels)
		.values({
			absorbRuleId: rule.id,
			title,
			url: link,
			thumbnailUrl: image?.url ?? null,
			lastUpdatedAt: (lastBuildDate ? new Date(lastBuildDate) : new Date()).toISOString(),
			importedAt: new Date().toISOString(),
		})
		.onConflictDoUpdate({
			target: schema.channels.url,
			set: {
				lastUpdatedAt: (lastBuildDate ? new Date(lastBuildDate) : new Date()).toISOString(),
				importedAt: new Date().toISOString(),
			},
		})
		.returning();

	return result[0];
};

export const upsertEntry = async (d1: D1Database, channel: Awaited<ReturnType<typeof upsertChannel>>, item: RSSItem, content: string) => {
	const { link: url, title, description: _description, enclosure, pubDate, category, author } = item;

	const description = _description?.replace(/\n+/g, ' ') ?? null;
	const metadata = { category, author };
	const thumbnailUrl = enclosure?.url ?? null;
	const publishedAt = (pubDate ? new Date(pubDate) : new Date()).toISOString();
	const now = new Date().toISOString();

	const db = drizzle(d1, { schema });
	const result = await db
		.insert(schema.entries)
		.values({
			channelId: channel.id,
			url,
			title,
			description,
			content,
			thumbnailUrl,
			metadata,
			publishedAt,
		})
		.onConflictDoUpdate({
			target: schema.entries.url,
			set: {
				title,
				description,
				content,
				thumbnailUrl,
				metadata,
				importedAt: now,
			},
		})
		.returning();

	return result[0];
};

export const getEntryById = async (d1: D1Database, id: number) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findFirst({ where: eq(schema.entries.id, id) });
};

export const paginateEntries = async (d1: D1Database, limit: number, offset: number) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findMany({
		orderBy: (record, { desc }) => [desc(record.publishedAt)],
		limit,
		offset,
	});
};
