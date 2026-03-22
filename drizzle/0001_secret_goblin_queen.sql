CREATE TABLE `backtestResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(64) NOT NULL,
	`symbol` varchar(64) NOT NULL,
	`timeframe` varchar(64) NOT NULL DEFAULT '1h',
	`initialCapital` varchar(255) NOT NULL,
	`finalValue` varchar(255) NOT NULL,
	`profitLoss` varchar(255) NOT NULL,
	`profitLossPercent` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`totalTrades` int NOT NULL DEFAULT 0,
	`winRate` varchar(255) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backtestResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(64) NOT NULL,
	`symbol` varchar(64) NOT NULL,
	`baseAmount` varchar(255) NOT NULL,
	`quoteAmount` varchar(255) NOT NULL,
	`totalValue` varchar(255) NOT NULL,
	`snapshotAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(64) NOT NULL,
	`symbol` varchar(64) NOT NULL,
	`side` varchar(10) NOT NULL,
	`amount` varchar(255) NOT NULL,
	`price` varchar(255) NOT NULL,
	`totalValue` varchar(255) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'completed',
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trades_id` PRIMARY KEY(`id`)
);
