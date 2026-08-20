ALTER TABLE `globalRoomMessages` ADD `pinnedAt` timestamp;--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `pinnedBy` varchar(80);