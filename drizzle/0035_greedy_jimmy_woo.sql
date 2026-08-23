CREATE TABLE `spcaDiagnosticReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`codes` varchar(500) NOT NULL,
	`summary` varchar(700) NOT NULL,
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`resolvedAt` timestamp,
	`resolvedBy` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `spcaDiagnosticReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `spcaDiagnosticReports_account_created_index` UNIQUE(`accountId`,`createdAt`)
);
