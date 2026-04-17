-- Nullify any already-stale references left by past deletions
UPDATE public.orders   SET contact_id = NULL WHERE contact_id IS NOT NULL AND contact_id NOT IN (SELECT id FROM public.contacts);
UPDATE public.meetings SET contact_id = NULL WHERE contact_id IS NOT NULL AND contact_id NOT IN (SELECT id FROM public.contacts);
UPDATE public.tasks    SET contact_id = NULL WHERE contact_id IS NOT NULL AND contact_id NOT IN (SELECT id FROM public.contacts);

-- Recreate FK constraints with ON DELETE SET NULL so future deletes don't orphan or block
ALTER TABLE public.orders   DROP CONSTRAINT IF EXISTS orders_contact_id_fkey;
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_contact_id_fkey;
ALTER TABLE public.tasks    DROP CONSTRAINT IF EXISTS tasks_contact_id_fkey;

ALTER TABLE public.orders   ADD CONSTRAINT orders_contact_id_fkey   FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.meetings ADD CONSTRAINT meetings_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.tasks    ADD CONSTRAINT tasks_contact_id_fkey    FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
