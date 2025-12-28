UPDATE users
SET trial_ends_at = trial_started_at + 259200000
WHERE trial_started_at IS NOT NULL
  AND trial_ends_at IS NULL;
