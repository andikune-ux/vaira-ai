CREATE TABLE `globalRoomProfileComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetAccountId` int NOT NULL,
	`authorAccountId` int NOT NULL,
	`authorDisplayName` varchar(120) NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedAt` timestamp,
	`reviewedBy` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `globalRoomProfileComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomProfileLoves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetAccountId` int NOT NULL,
	`accountId` int NOT NULL,
	`loveDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `globalRoomProfileLoves_id` PRIMARY KEY(`id`)
);
