CREATE TABLE `airaAccessTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`criterion` enum('pro','premium','admin') NOT NULL,
	`durationDays` int,
	`expiresAt` timestamp,
	`redeemedAt` timestamp,
	`redeemedAccountId` int,
	`createdBy` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `airaAccessTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `airaAccessTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
