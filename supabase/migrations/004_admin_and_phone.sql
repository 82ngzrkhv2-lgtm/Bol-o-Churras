-- =====================================================
-- Migração 004: Admin e WhatsApp para Organizadores
-- =====================================================

-- 1. Adicionar novas colunas na tabela profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS is_admin boolean default false;

-- 2. Atualizar o trigger de criação de usuário para capturar o whatsapp do meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'whatsapp'
  )
  ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp
    WHERE public.profiles.whatsapp IS NULL;
  RETURN NEW;
END;
$$;

-- 3. Políticas para o Admin visualizar tudo
-- Admin tem acesso total de leitura em profiles
CREATE POLICY "admin read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Admin tem acesso total de leitura em groups
CREATE POLICY "admin read all groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
