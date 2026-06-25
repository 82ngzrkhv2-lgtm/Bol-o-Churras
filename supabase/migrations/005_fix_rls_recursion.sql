-- =====================================================
-- Migração 005: Correção de recursão infinita na RLS de profiles e Trigger LGPD
-- =====================================================

-- 1. Remover a política antiga que causava recursão
DROP POLICY IF EXISTS "admin read all profiles" ON public.profiles;

-- 2. Criar a função security definer para verificar se o usuário é admin
-- Como é SECURITY DEFINER, ela roda com os privilégios do criador,
-- contornando o RLS e evitando a recursão infinita ao consultar a mesma tabela.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- 3. Recriar a política usando a função security definer
CREATE POLICY "admin read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
  );

-- 4. Atualizar a política de leitura em groups também para usar a nova função (mais limpo e rápido)
DROP POLICY IF EXISTS "admin read all groups" ON public.groups;

CREATE POLICY "admin read all groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
  );

-- 5. Atualizar o trigger de novo usuário para registrar a aceitação de termos (LGPD) e WhatsApp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, whatsapp, accepted_terms_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'whatsapp',
    COALESCE((NEW.raw_user_meta_data->>'accepted_terms_at')::timestamptz, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    accepted_terms_at = EXCLUDED.accepted_terms_at
    WHERE public.profiles.whatsapp IS NULL OR public.profiles.accepted_terms_at IS NULL;
  RETURN NEW;
END;
$$;

-- 6. Garantir que o email do administrador tenha is_admin = true no banco de dados
UPDATE public.profiles
SET is_admin = true
WHERE email = 'reinandzn01@gmail.com';
