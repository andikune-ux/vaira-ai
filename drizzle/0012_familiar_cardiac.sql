ALTER TABLE `globalRoomReports` ADD `contextMessage` text;--> statement-breakpoint
ALTER TABLE `globalRoomReports` ADD `priority` enum('normal','high') DEFAULT 'normal' NOT NULL;