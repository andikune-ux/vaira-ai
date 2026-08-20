ALTER TABLE `globalRoomMessages` ADD `replyToId` int;--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `replyToDisplayName` varchar(120);--> statement-breakpoint
ALTER TABLE `globalRoomMessages` ADD `replyToContent` text;