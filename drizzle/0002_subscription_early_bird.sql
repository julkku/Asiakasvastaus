CREATE TABLE `subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `stripe_customer_id` text,
  `stripe_subscription_id` text,
  `stripe_price_id` text,
  `status` text NOT NULL,
  `current_period_end` integer,
  `cancel_at_period_end` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_user_unique` ON `subscriptions` (`user_id`);
