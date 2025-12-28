ALTER TABLE `organization_profiles` ADD COLUMN `industry` text NOT NULL DEFAULT 'MUU';
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD COLUMN `communication_role` text NOT NULL DEFAULT 'ASIAKASPALVELU';
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD COLUMN `refund_policy` text NOT NULL DEFAULT 'EI_LUVATA';
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD COLUMN `caution_level` text NOT NULL DEFAULT 'TASAPAINOINEN';
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD COLUMN `forbidden_phrases` text NOT NULL DEFAULT '[]';
--> statement-breakpoint
ALTER TABLE `organization_profiles` ADD COLUMN `terminology` text NOT NULL DEFAULT '{}';
