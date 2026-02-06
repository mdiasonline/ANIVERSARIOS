-- Add role column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create policy to allow Admins to see ALL profiles
-- (Standard users should only see their own, which is already set)
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
);

-- Create policy to allow Admins to update roles
CREATE POLICY "Admins can update roles"
ON user_profiles FOR UPDATE
USING (
  auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
);
