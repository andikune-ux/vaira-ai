CREATE TABLE `globalRoomUserSettings` (
	`accountId` int NOT NULL,
	`bubbleScale` int NOT NULL DEFAULT 100,
	`bubbleGap` int NOT NULL DEFAULT 8,
	`audioLabelsVisible` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalRoomUserSettings_accountId` PRIMARY KEY(`accountId`)
);
