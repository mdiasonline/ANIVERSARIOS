-- 1. RESTORE ADMIN PERMISSIONS
-- Set role to 'admin' for any user with 'mdias.online' in their email
UPDATE user_profiles
SET role = 'admin'
WHERE email ILIKE '%mdias.online%';

-- 2. UPDATE PROTECTION TRIGGER
-- Drop the old strict trigger
DROP TRIGGER IF EXISTS check_admin_demotion ON user_profiles;
DROP FUNCTION IF EXISTS protect_admin_demotion;

-- Create a more robust function that checks for the pattern
CREATE OR REPLACE FUNCTION protect_admin_demotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user being updated matches the protected pattern
  IF OLD.email ILIKE '%mdias.online%' THEN
    -- If the role is being changed from 'admin' to anything else
    IF NEW.role != 'admin' THEN
      RAISE EXCEPTION 'Proteção Ativa: O usuário mdias.online não pode ser removido de administrador.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach the trigger
CREATE TRIGGER check_admin_demotion
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_admin_demotion();
