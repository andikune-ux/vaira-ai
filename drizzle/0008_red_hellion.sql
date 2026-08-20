CREATE TABLE `globalRoomBlocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockerAccountId` int NOT NULL,
	`blockedAccountId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `globalRoomBlocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomConsents` (
	`accountId` int NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`ageConfirmed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `globalRoomConsents_accountId` PRIMARY KEY(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `globalRoomMessages_id` PRIMARY KEY(`id`)
);
