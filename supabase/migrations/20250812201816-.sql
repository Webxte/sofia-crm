-- Finalize RLS hardening without creating helper functions to avoid migration errors

-- CONTACTS
DROP POLICY IF EXISTS "Allow all authenticated users full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all authenticated users to view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all authenticated users to insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all authenticated users to update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all authenticated users to delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Agents can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Agents can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Agents can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Agents can delete own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can access their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;

-- MEETINGS
DROP POLICY IF EXISTS "Allow all authenticated users full access to meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can view all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Agents can view own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Agents can insert own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Agents can update own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Agents can delete own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can manage their own meetings" ON public.meetings;

-- ORDERS
DROP POLICY IF EXISTS "Allow all authenticated users full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Agents can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Agents can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Agents can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Agents can delete own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;

-- ORDER ITEMS
DROP POLICY IF EXISTS "Allow all authenticated users full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can see order items of orders they can see" ON public.order_items;
DROP POLICY IF EXISTS "Users can manage order items of orders they can manage" ON public.order_items;
DROP POLICY IF EXISTS "Users can manage order items for their orders" ON public.order_items;

-- PRODUCTS
DROP POLICY IF EXISTS "Allow all authenticated users full access to products" ON public.products;
DROP POLICY IF EXISTS "All users can view products" ON public.products;
DROP POLICY IF EXISTS "All authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- TASKS
DROP POLICY IF EXISTS "Allow all authenticated users full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Agents can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Agents can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Agents can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Agents can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;

-- SETTINGS
DROP POLICY IF EXISTS "All users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Allow admin users full access to settings" ON public.settings;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.settings;

-- Ensure profiles are created on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Organization memberships: minimize to safe SELECT policy only if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'organization_members'
  ) THEN
    DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_members;
    DROP POLICY IF EXISTS "Organization owners can manage members" ON public.organization_members;

    ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their organization memberships" ON public.organization_members
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END
$$;