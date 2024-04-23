import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import { CEFRLevel, Entry } from '../schema';

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

export const paginateEntries = async (d1: D1Database, limit: number, offset: number) => {
	const db = drizzle(d1, { schema });
	return db.query.entries.findMany({
		orderBy: (record, { desc }) => [desc(record.publishedAt)],
		limit,
		offset,
	});
};

export const getCalibratedEntryByEntryIdAndCefrLevel = async (d1: D1Database, entryId: number, cefrLevel: CEFRLevel = 'A1') => {
	const db = drizzle(d1, { schema });
	return db.query.calibratedEntries.findFirst({
		where: (record, { eq, and }) => and(eq(record.entryId, entryId), eq(record.cefrLevel, cefrLevel)),
	});
};
