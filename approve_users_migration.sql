-- Add approved column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- Approve all existing users
UPDATE user_profiles SET approved = TRUE WHERE approved IS FALSE;

-- Ensure mdias.online is always approved
UPDATE user_profiles SET approved = TRUE WHERE email ILIKE '%mdias.online%';

-- Update the handle_new_user function to set approved = FALSE by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, approved)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    'user', -- Default role
    FALSE   -- Default approved status (Pending)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
