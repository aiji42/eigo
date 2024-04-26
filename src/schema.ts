import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { InferSelectModel, relations } from 'drizzle-orm';
import { Content } from './libs/content';

export const absorbRules = sqliteTable('AbsorbRules', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	name: text('name').notNull(),
	type: text('type', { enum: ['SSR2.0'] }).notNull(),
	url: text('url').notNull(),
	isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
});

export const absorbRuleRelations = relations(absorbRules, ({ one }) => ({
	channel: one(channels),
}));

export const channels = sqliteTable('Channels', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	absorbRuleId: integer('absorbRuleId')
		.notNull()
		.references(() => absorbRules.id),
	title: text('title').notNull(),
	url: text('url').notNull().unique(),
	thumbnailUrl: text('thumbnailUrl'),
	lastUpdatedAt: integer('lastUpdatedAt', { mode: 'timestamp' }).notNull(),
});

export const channelsRelations = relations(channels, ({ many }) => ({
	entries: many(entries),
}));

export const entries = sqliteTable(
	'Entries',
	{
		id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
		channelId: integer('channelId')
			.notNull()
			.references(() => channels.id),
		url: text('url').notNull().unique(),
		title: text('title').notNull(),
		description: text('description'),
		content: text('content', { mode: 'json' }).notNull().$type<Content>(),
		thumbnailUrl: text('thumbnailUrl'),
		metadata: text('metadata', { mode: 'json' }),
		publishedAt: integer('publishedAt', { mode: 'timestamp' }).notNull(),
	},
	(table) => {
		return {
			publishedAtIndex: index('publishedAt_idx').on(table.publishedAt),
		};
	},
);

export type Entry = InferSelectModel<typeof entries>;

export const entriesRelations = relations(entries, ({ many }) => ({
	calibratedEntries: many(calibratedEntries),
}));

export const calibratedEntries = sqliteTable(
	'CalibratedEntries',
	{
		id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
		entryId: integer('entryId')
			.notNull()
			.references(() => entries.id),
		cefrLevel: text('cefrLevel').notNull().$type<CEFRLevel>(),
		title: text('title').notNull(),
		content: text('content', { mode: 'json' }).notNull().$type<Content>(),
		thumbnailUrl: text('thumbnailUrl'),
		metadata: text('metadata', { mode: 'json' }),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	},
	(table) => {
		return {
			unique: unique().on(table.entryId, table.cefrLevel),
		};
	},
);

export type CalibratedEntry = InferSelectModel<typeof calibratedEntries>;

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
