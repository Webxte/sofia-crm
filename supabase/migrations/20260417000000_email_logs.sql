CREATE TABLE IF NOT EXISTS public.email_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id    uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  order_id      uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  type          text NOT NULL CHECK (type IN ('order', 'contact')),
  to_email      text NOT NULL,
  subject       text NOT NULL,
  body_preview  text,
  sent_by_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_by_name  text,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Agents see logs they sent; admins see all
CREATE POLICY "email_logs_select" ON public.email_logs
  FOR SELECT USING (
    sent_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only service role inserts (edge functions use service role key)
CREATE POLICY "email_logs_insert" ON public.email_logs
  FOR INSERT WITH CHECK (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_logs;
