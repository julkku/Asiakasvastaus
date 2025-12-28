CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stripe_events_event_id_unique` ON `stripe_events` (`event_id`);
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD `stripe_customer_id` text;
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD `stripe_subscription_id` text;
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD `subscription_status` text;
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD `current_period_end` integer;
