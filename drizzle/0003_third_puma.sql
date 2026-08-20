CREATE TABLE `manualAccountSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manualAccountSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `manualAccountSessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `manualAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`username` varchar(40) NOT NULL,
	`birthDate` varchar(10) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`recoveryTokenHash` varchar(255) NOT NULL,
	`status` enum('active','blocked','closing','blacklisted') NOT NULL DEFAULT 'active',
	`failedLoginAttempts` int NOT NULL DEFAULT 0,
	`blockedAt` timestamp,
	`loginCooldownUntil` timestamp,
	`closeRequestedAt` timestamp,
	`blacklistedAt` timestamp,
	`termsAcceptedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLoginAt` timestamp,
	CONSTRAINT `manualAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `manualAccounts_username_unique` UNIQUE(`username`),
	CONSTRAINT `manualAccounts_email_unique` UNIQUE(`email`),
	CONSTRAINT `manualAccounts_phone_unique` UNIQUE(`phone`)
);
