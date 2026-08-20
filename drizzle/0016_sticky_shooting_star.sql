ALTER TABLE `airaAccessTokens` ADD `revokedAt` timestamp;--> statement-breakpoint
ALTER TABLE `airaAccessTokens` ADD `revokedBy` varchar(80);