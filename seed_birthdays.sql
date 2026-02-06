-- Inserir 10 aniversários para teste
-- Este script tenta identificar automaticamente um usuário para ser o dono dos registros.

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Tenta pegar o ID do usuário logado (funciona se rodar via App)
  target_user_id := auth.uid();
  
  -- 2. Se for NULL (SQL Editor), pega o primeiro usuário disponível no banco
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users LIMIT 1;
  END IF;

  -- 3. Verifica se conseguiu um ID válido
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado no banco de dados. Cadastre pelo menos um usuário no sistema antes de rodar este script.';
  END IF;

  -- 4. Insere os registros
  INSERT INTO birthdays (name, date, phone, email, user_id, created_by)
  VALUES
    ('Ana Silva', '1995-02-10', '11999990001', 'ana.silva@exemplo.com', target_user_id, target_user_id),
    ('Carlos Souza', '1988-02-15', '21988880002', 'carlos.souza@exemplo.com', target_user_id, target_user_id),
    ('Marcos Oliveira', '2001-03-01', '31977770003', 'marcos.oliveira@exemplo.com', target_user_id, target_user_id),
    ('Fernanda Lima', '1990-05-20', '41966660004', 'fernanda.lima@exemplo.com', target_user_id, target_user_id),
    ('João Pereira', '1985-07-12', '51955550005', 'joao.pereira@exemplo.com', target_user_id, target_user_id),
    ('Beatriz Santos', '1998-09-05', '61944440006', 'beatriz.santos@exemplo.com', target_user_id, target_user_id),
    ('Rafael Costa', '1992-10-30', '71933330007', 'rafael.costa@exemplo.com', target_user_id, target_user_id),
    ('Julia Martins', '2005-12-25', '81922220008', 'julia.martins@exemplo.com', target_user_id, target_user_id),
    ('Pedro Rocha', '1980-01-15', '91911110009', 'pedro.rocha@exemplo.com', target_user_id, target_user_id),
    ('Luana Dias', '1999-02-06', '11900000010', 'luana.dias@exemplo.com', target_user_id, target_user_id);

  RAISE NOTICE 'Aniversários inseridos com sucesso para o usuário ID: %', target_user_id;
END $$;
