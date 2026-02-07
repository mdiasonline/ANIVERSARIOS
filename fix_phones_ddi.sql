-- ==========================================================
-- MIGRATION: NORMALIZE PHONE NUMBERS (ADD 55)
-- ==========================================================
-- This script does the following:
-- 1. Removes all non-digit characters from phone numbers (standardization).
-- 2. Checks if the cleaned number starts with '55'.
-- 3. If NOT, it prepends '55'.
-- ==========================================================

UPDATE birthdays
SET phone = '55' || regexp_replace(phone, '\D', '', 'g')
WHERE phone IS NOT NULL
  AND length(phone) > 0
  -- Check if the cleaned version does NOT start with 55
  AND regexp_replace(phone, '\D', '', 'g') NOT LIKE '55%';

-- Optional: Clean up numbers that already have 55 but might have formatting
-- This ensures numbers like "+55 (11) 9..." become "55119..."
UPDATE birthdays
SET phone = regexp_replace(phone, '\D', '', 'g')
WHERE phone IS NOT NULL
  AND length(phone) > 0
  AND regexp_replace(phone, '\D', '', 'g') LIKE '55%';
