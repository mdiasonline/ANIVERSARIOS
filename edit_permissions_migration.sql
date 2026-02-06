-- EDIT PERMISSIONS MIGRATION

-- 1. Add created_by column
ALTER TABLE birthdays 
ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id);

-- 2. Backfill existing records (Optional: assign to Admins or leave NULL)
-- Ideally, we assign them to a default admin if known, but leaving them NULL 
-- means only Admins can edit them (which satisfies the requirement).

-- 3. Update RLS Policies

-- Drop old policies to clear the way
DROP POLICY IF EXISTS "Admin Update" ON birthdays;
DROP POLICY IF EXISTS "Admin Delete" ON birthdays;

-- POLICY: UPDATE
-- Allow if Admin OR if User owns the record
CREATE POLICY "Owner or Admin Update"
ON birthdays FOR UPDATE
TO authenticated
USING (
  is_admin() OR 
  (auth.uid() = created_by)
);

-- POLICY: DELETE
-- Allow if Admin OR if User owns the record
CREATE POLICY "Owner or Admin Delete"
ON birthdays FOR DELETE
TO authenticated
USING (
  is_admin() OR 
  (auth.uid() = created_by)
);
