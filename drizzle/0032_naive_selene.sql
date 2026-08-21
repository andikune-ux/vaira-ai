ALTER TABLE `privateChatGroups` ADD `publicGroupId` varchar(24) NULL;--> statement-breakpoint
ALTER TABLE `privateChatGroups` ADD `publicGroupIdUpdatedAt` timestamp NULL;--> statement-breakpoint
UPDATE `privateChatGroups` SET `publicGroupId` = CONCAT('GRP-', LPAD(`id`, 8, '0')), `publicGroupIdUpdatedAt` = COALESCE(`createdAt`, NOW()) WHERE `publicGroupId` IS NULL;--> statement-breakpoint
ALTER TABLE `privateChatGroups` MODIFY COLUMN `publicGroupId` varchar(24) NOT NULL;--> statement-breakpoint
ALTER TABLE `privateChatGroups` MODIFY COLUMN `publicGroupIdUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `privateChatGroups` ADD CONSTRAINT `privateChatGroups_public_group_id_unique` UNIQUE(`publicGroupId`);
