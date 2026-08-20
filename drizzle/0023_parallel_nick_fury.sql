CREATE TABLE `globalRoomMessageReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`accountId` int NOT NULL,
	`emoji` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `globalRoomMessageReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomUserStatus` (
	`accountId` int NOT NULL,
	`status` varchar(80) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalRoomUserStatus_accountId` PRIMARY KEY(`accountId`)
);
