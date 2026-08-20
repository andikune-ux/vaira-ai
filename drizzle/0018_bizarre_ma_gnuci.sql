ALTER TABLE `globalRoomSettings` ADD `bubbleScale` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `globalRoomSettings` ADD `bubbleGap` int DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE `globalRoomSettings` ADD `bubbleScope` enum('admin','all') DEFAULT 'admin' NOT NULL;