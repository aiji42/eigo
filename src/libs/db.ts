import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { RSSFeed, RSSItem } from './rss-parser';
import { Content } from './content';
import { CalibratedEntry, CEFRLevel, entries, Entry } from '../schema';

export const getAllRules = async (d1: D1Database) => {
	const db = drizzle(d1, { schema });
	return db.query.absorbRules.findMany();
};

export const upsertChannel = async (d1: D1Database, rule: Awaited<ReturnType<typeof getAllRules>>[number], feed: RSSFeed) => {
	const {
		channel: { title, link, image, lastBuildDate },
	} = feed;
	const db = drizzle(d1, { schema });

	const lastUpdatedAt = lastBuildDate ? new Date(lastBuildDate) : new Date();

	const result = await db
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

	return result[0];
};

export const insertEntry = async (d1: D1Database, channel: Awaited<ReturnType<typeof upsertChannel>>, item: RSSItem, content: Content) => {
	const { link: url, title, description: _description, enclosure, pubDate, category, author } = item;

	const description = _description?.replace(/\n+/g, ' ') ?? null;
	const metadata = { category, author };
	const thumbnailUrl = enclosure?.url ?? null;
	const publishedAt = pubDate ? new Date(pubDate) : new Date();

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
		.returning();

	return result[0];
};

export const updateEntry = async (d1: D1Database, id: number, entry: Partial<Entry>) => {
	const db = drizzle(d1, { schema });
	const [result] = await db.update(entries).set(entry).where(eq(entries.id, id)).returning();
	return result;
};

export const getEntryById = async (d1: D1Database, id: number) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findFirst({ where: eq(schema.entries.id, id) });
};

export const getNextEntry = async (d1: D1Database, id: number) => {
	const entry = await getEntryById(d1, id);
	if (!entry) return null;
	const db = drizzle(d1, { schema });
	return db.query.entries.findFirst({
		where: (record, { lt, eq, and, or }) =>
			or(lt(record.publishedAt, entry.publishedAt), and(eq(record.publishedAt, entry.publishedAt), lt(record.id, entry.id))),
		orderBy: (record, { desc }) => [desc(record.publishedAt), desc(record.id)],
	});
};

export const getPrevEntry = async (d1: D1Database, id: number) => {
	const entry = await getEntryById(d1, id);
	if (!entry) return null;
	const db = drizzle(d1, { schema });
	return db.query.entries.findFirst({
		where: (record, { gt, eq, and, or }) =>
			or(gt(record.publishedAt, entry.publishedAt), and(eq(record.publishedAt, entry.publishedAt), gt(record.id, entry.id))),
		orderBy: (record, { asc }) => [asc(record.publishedAt), asc(record.id)],
	});
};

export const getEntryByUrl = async (d1: D1Database, url: string) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findFirst({ where: eq(schema.entries.url, url) });
};

export const paginateEntries = async (d1: D1Database, limit: number, offset: number) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findMany({
		orderBy: (record, { desc }) => [desc(record.publishedAt)],
		limit,
		offset,
	});
};

export const getAllCalibratedEntriesByEntryId = async (d1: D1Database, entryId: number) => {
	const db = drizzle(d1, { schema });
	return db.query.calibratedEntries.findMany({ where: eq(schema.calibratedEntries.entryId, entryId) });
};

export const getCalibratedEntryByEntryIdAndCefrLevel = async (d1: D1Database, entryId: number, cefrLevel: CEFRLevel = 'A1') => {
	const db = drizzle(d1, { schema });
	return db.query.calibratedEntries.findFirst({
		where: (record, { eq, and }) => and(eq(record.entryId, entryId), eq(record.cefrLevel, cefrLevel)),
	});
};

export const insertCalibratedEntry = async (d1: D1Database, entry: Entry, cefrLevel: CEFRLevel, title: string, content: Content) => {
	const db = drizzle(d1, { schema });
	const result = await db
		.insert(schema.calibratedEntries)
		.values({
			entryId: entry.id,
			cefrLevel,
			title,
			content,
			thumbnailUrl: entry.thumbnailUrl,
			createdAt: new Date(),
		})
		.returning();

	return result[0];
};

export const updateCalibratedEntry = async (d1: D1Database, id: number, calibratedEntry: Partial<CalibratedEntry>) => {
	const db = drizzle(d1, { schema });
	const [result] = await db.update(schema.calibratedEntries).set(calibratedEntry).where(eq(schema.calibratedEntries.id, id)).returning();
	return result;
};
