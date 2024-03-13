CREATE TABLE `CalibratedEntries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entryId` integer NOT NULL,
	`cefrLevel` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`thumbnailUrl` text,
	`metadata` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`entryId`) REFERENCES `Entries`(`id`) ON UPDATE no action ON DELETE no action
);
