CREATE TABLE `globalRoomModeration` (
	`accountId` int NOT NULL,
	`micMuted` boolean NOT NULL DEFAULT true,
	`roomAudioBlocked` boolean NOT NULL DEFAULT false,
	`unmuteRequested` boolean NOT NULL DEFAULT false,
	`reason` varchar(240),
	`updatedBy` varchar(80),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalRoomModeration_accountId` PRIMARY KEY(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomPresence` (
	`accountId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`leftAt` timestamp,
	CONSTRAINT `globalRoomPresence_accountId` PRIMARY KEY(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `globalRoomSettings` (
	`roomKey` varchar(40) NOT NULL,
	`locked` boolean NOT NULL DEFAULT false,
	`updatedBy` varchar(80),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalRoomSettings_roomKey` PRIMARY KEY(`roomKey`)
);
