ALTER TABLE `manualAccounts` ADD `publicId` varchar(32);--> statement-breakpoint
ALTER TABLE `manualAccounts` ADD CONSTRAINT `manualAccounts_publicId_unique` UNIQUE(`publicId`);