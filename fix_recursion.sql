-- FIX 500 ERROR (Infinite Recursion)

-- 1. Create a secure function to check if the current user is an admin
-- SECURITY DEFINER allows this function to bypass RLS when querying the table, preventing the loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_profiles;

-- 3. Re-create policies using the new safe function
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  is_admin()
);

CREATE POLICY "Admins can update roles"
ON user_profiles FOR UPDATE
USING (
  is_admin()
);
