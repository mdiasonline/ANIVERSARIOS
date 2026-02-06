-- FIX BIRTHDAY PERMISSIONS
-- 1. Enable RLS on birthdays table if not already enabled
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Enable read access for all users" ON birthdays;
DROP POLICY IF EXISTS "Enable insert for all users" ON birthdays;
DROP POLICY IF EXISTS "Enable update for all users" ON birthdays;
DROP POLICY IF EXISTS "Enable delete for all users" ON birthdays;

DROP POLICY IF EXISTS "Public Read Access" ON birthdays;
DROP POLICY IF EXISTS "Admin Insert" ON birthdays;
DROP POLICY IF EXISTS "Public Insert" ON birthdays;  -- Dropping potential old names
DROP POLICY IF EXISTS "Admin Update" ON birthdays;
DROP POLICY IF EXISTS "Admin Delete" ON birthdays;


-- 3. Policy: EVERYONE (Authenticated) can VIEW (Select)
CREATE POLICY "Public Read Access"
ON birthdays FOR SELECT
TO authenticated
USING (true);

-- 4. Policy: EVERYONE (Authenticated) can INSERT (Create)
CREATE POLICY "Public Insert"
ON birthdays FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Policy: ONLY ADMINS can UPDATE
CREATE POLICY "Admin Update"
ON birthdays FOR UPDATE
TO authenticated
USING (
  is_admin()
);

-- 6. Policy: ONLY ADMINS can DELETE
CREATE POLICY "Admin Delete"
ON birthdays FOR DELETE
TO authenticated
USING (
  is_admin()
);
