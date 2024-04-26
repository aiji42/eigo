ALTER TABLE AbsorbRules ADD `isActive` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `AbsorbRules` DROP COLUMN `rule`;