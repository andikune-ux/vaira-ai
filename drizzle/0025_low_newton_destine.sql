ALTER TABLE `globalRoomReports` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `globalRoomReports` ADD `deletedBy` varchar(80);