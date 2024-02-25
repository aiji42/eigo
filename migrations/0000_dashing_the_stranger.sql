CREATE TABLE `AbsorbRules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`rule` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Channels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`absorbRuleId` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`thumbnailUrl` text,
	`lastUpdatedAt` integer NOT NULL,
	FOREIGN KEY (`absorbRuleId`) REFERENCES `AbsorbRules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channelId` integer NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`thumbnailUrl` text,
	`metadata` text,
	`publishedAt` integer NOT NULL,
	`isTTSed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`channelId`) REFERENCES `Channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Channels_url_unique` ON `Channels` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `Entries_url_unique` ON `Entries` (`url`);