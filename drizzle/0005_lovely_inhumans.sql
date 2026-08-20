CREATE TABLE `airaxCloudBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`username` varchar(40) NOT NULL,
	`fileName` varchar(180) NOT NULL,
	`storageKey` varchar(320) NOT NULL,
	`sizeBytes` int NOT NULL,
	`status` enum('active','restricted','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `airaxCloudBackups_id` PRIMARY KEY(`id`),
	CONSTRAINT `airaxCloudBackups_storageKey_unique` UNIQUE(`storageKey`)
);
