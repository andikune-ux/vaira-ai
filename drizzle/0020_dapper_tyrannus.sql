ALTER TABLE `globalRoomMessages` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `deletedOriginalContent` text;--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `deletedOriginalReplyToId` int;--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `deletedOriginalReplyToDisplayName` varchar(120);--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `deletedOriginalReplyToContent` text;