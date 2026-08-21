CREATE TABLE `airaConversationHistories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`conversationId` varchar(96) NOT NULL,
	`mode` enum('aira','hot_pro','scientist') NOT NULL,
	`title` varchar(160) NOT NULL,
	`messagesJson` text NOT NULL,
	`isPrivate` boolean NOT NULL DEFAULT false,
	`archivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `airaConversationHistories_id` PRIMARY KEY(`id`),
	CONSTRAINT `aira_history_account_conversation_unique` UNIQUE(`accountId`,`conversationId`)
);
