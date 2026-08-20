CREATE TABLE `administratorAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminUsername` varchar(80) NOT NULL,
	`action` varchar(120) NOT NULL,
	`targetType` varchar(48) NOT NULL,
	`targetId` varchar(100) NOT NULL,
	`targetLabel` varchar(220) NOT NULL,
	`detail` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `administratorAuditLogs_id` PRIMARY KEY(`id`)
);
