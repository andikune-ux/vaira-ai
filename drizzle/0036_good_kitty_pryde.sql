CREATE TABLE `householdFinanceAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`periodKey` varchar(7) NOT NULL,
	`resultJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `householdFinanceAnalyses_id` PRIMARY KEY(`id`),
	CONSTRAINT `householdFinanceAnalyses_account_created_index` UNIQUE(`accountId`,`createdAt`)
);
