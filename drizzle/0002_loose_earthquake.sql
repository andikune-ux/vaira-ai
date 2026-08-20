CREATE TABLE `globalTestSnapshots` (
	`scope` varchar(40) NOT NULL,
	`payload` text NOT NULL,
	`updatedByUserId` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalTestSnapshots_scope` PRIMARY KEY(`scope`)
);
