-- Function to prevent demotion of specific admin
CREATE OR REPLACE FUNCTION protect_admin_demotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user being updated is the protected admin
  IF OLD.email = 'mdias.online' THEN
    -- If the role is being changed from 'admin' to anything else
    IF NEW.role != 'admin' THEN
      RAISE EXCEPTION 'O usuário mdias.online não pode ser removido de administrador.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before update on user_profiles
DROP TRIGGER IF EXISTS check_admin_demotion ON user_profiles;
CREATE TRIGGER check_admin_demotion
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_admin_demotion();
