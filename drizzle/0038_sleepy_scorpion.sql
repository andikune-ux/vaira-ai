CREATE TABLE `manualFinanceSnapshots` (
	`accountId` int NOT NULL,
	`payload` mediumtext NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manualFinanceSnapshots_accountId` PRIMARY KEY(`accountId`)
);
