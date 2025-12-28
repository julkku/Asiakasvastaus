CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`user_id` text,
	`context` text,
	`created_at` integer NOT NULL
);
