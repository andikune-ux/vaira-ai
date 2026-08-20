CREATE TABLE `administratorTokenSettings` (
	`settingId` int NOT NULL,
	`autoDeleteDays` int NOT NULL DEFAULT 0,
	`updatedBy` varchar(80),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `administratorTokenSettings_settingId` PRIMARY KEY(`settingId`)
);
--> statement-breakpoint
ALTER TABLE `airaAccessTokens` ADD `tokenHistoryHiddenAt` timestamp;--> statement-breakpoint
ALTER TABLE `airaAccessTokens` ADD `redeemHistoryHiddenAt` timestamp;