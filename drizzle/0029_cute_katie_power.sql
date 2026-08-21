CREATE TABLE `privateChatGroupRemovedMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`accountId` int NOT NULL,
	`blockedAt` timestamp NOT NULL DEFAULT (now()),
	`removedByAccountId` int NOT NULL,
	CONSTRAINT `privateChatGroupRemovedMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `privateChatGroupRemovedMembers_group_account_unique` UNIQUE(`groupId`,`accountId`)
);
--> statement-breakpoint
ALTER TABLE `privateChatGroups` ADD `photoStorageKey` varchar(320);