-- 006_push_notifications.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_subscription jsonb;
