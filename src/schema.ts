import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const absorbRules = sqliteTable('AbsorbRules', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	name: text('name').notNull(),
	type: text('type', { enum: ['SSR2.0'] }).notNull(),
	url: text('url').notNull(),
	rule: text('rule', { mode: 'json' }).notNull().$type<{
		contentSelector: string;
	}>(),
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
	lastUpdatedAt: text('lastUpdatedAt').notNull(),
	importedAt: text('importedAt')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const channelsRelations = relations(channels, ({ many }) => ({
	entries: many(entries),
}));

export const entries = sqliteTable('Entries', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
	channelId: integer('channelId')
		.notNull()
		.references(() => channels.id),
	url: text('url').notNull().unique(),
	title: text('title').notNull(),
	description: text('description'),
	content: text('content').notNull(),
	thumbnailUrl: text('thumbnailUrl'),
	metadata: text('metadata', { mode: 'json' }),
	publishedAt: text('publishedAt').notNull(),
	importedAt: text('importedAt')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});
