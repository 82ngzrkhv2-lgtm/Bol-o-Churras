-- Adiciona novas colunas na tabela participants
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'pending';

-- Atualiza dados existentes baseados na coluna antiga has_paid
UPDATE public.participants SET payment_status = 'paid' WHERE has_paid = true;

-- Bucket de Storage para Comprovantes
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Habilita RLS no bucket de storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública (Qualquer um pode ver as imagens dos comprovantes com a URL correta)
CREATE POLICY "Public Access for Receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

-- Política de Upload Público (Participantes podem fazer upload sem login)
CREATE POLICY "Public Upload to Receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');
