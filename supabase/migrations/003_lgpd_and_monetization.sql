-- Adiciona colunas para controle de LGPD (Aceite dos Termos)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;

ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;

-- Adiciona colunas para Monetização (Taxa da Plataforma)
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS platform_fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS platform_fee_receipt_url TEXT;

-- Atualiza políticas de segurança para permitir que organizadores editem esses campos em groups
-- A política existente `Organizers can update their groups` já cobre atualizações na tabela groups.
