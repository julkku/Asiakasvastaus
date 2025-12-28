ALTER TABLE `users` ADD COLUMN `email_verified_at` integer;
--> statement-breakpoint

CREATE TABLE `email_verification_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_token_hash_unique` ON `email_verification_tokens` (`token_hash`);
--> statement-breakpoint

CREATE TABLE `trial_devices` (
  `id` text PRIMARY KEY NOT NULL,
  `device_id_hash` text NOT NULL,
  `first_user_id` text NOT NULL,
  `first_seen_at` integer NOT NULL,
  FOREIGN KEY (`first_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trial_devices_device_hash_unique` ON `trial_devices` (`device_id_hash`);
--> statement-breakpoint

CREATE TABLE `registration_ip_limits` (
  `id` text PRIMARY KEY NOT NULL,
  `ip_hash` text NOT NULL,
  `window_start` integer NOT NULL,
  `count` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `registration_ip_hash_index` ON `registration_ip_limits` (`ip_hash`);
