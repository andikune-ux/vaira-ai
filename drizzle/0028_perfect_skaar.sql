CREATE TABLE `privateChatGroupInvites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`createdByAccountId` int NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privateChatGroupInvites_id` PRIMARY KEY(`id`),
	CONSTRAINT `privateChatGroupInvites_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `privateChatGroupMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`accountId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privateChatGroupMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `privateChatGroupMembers_group_account_unique` UNIQUE(`groupId`,`accountId`)
);
--> statement-breakpoint
CREATE TABLE `privateChatGroupMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`accountId` int NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`content` text NOT NULL,
	`replyToId` int,
	`replyToDisplayName` varchar(120),
	`replyToContent` text,
	`deletedAt` timestamp,
	`deletedOriginalContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privateChatGroupMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privateChatGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`createdByAccountId` int NOT NULL,
	`adminAccountId` int NOT NULL,
	`status` enum('active','frozen','deleted') NOT NULL DEFAULT 'active',
	`frozenAt` timestamp,
	`frozenBy` varchar(80),
	`deletedAt` timestamp,
	`deletedBy` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `privateChatGroups_id` PRIMARY KEY(`id`)
);
