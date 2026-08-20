CREATE TABLE `globalRoomReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterAccountId` int NOT NULL,
	`reporterUsername` varchar(40) NOT NULL,
	`reportedAccountId` int NOT NULL,
	`reportedUsername` varchar(40) NOT NULL,
	`reportedDisplayName` varchar(120) NOT NULL,
	`reason` enum('spam','harassment','harmful','other') NOT NULL,
	`details` text,
	`status` enum('pending','reviewing','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(80),
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `globalRoomReports_id` PRIMARY KEY(`id`)
);
