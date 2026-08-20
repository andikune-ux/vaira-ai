CREATE TABLE `financeSnapshots` (
	`userId` int NOT NULL,
	`payload` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financeSnapshots_userId` PRIMARY KEY(`userId`)
);
