-- 1. Create a database trigger to automatically add new signups to the User table
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  -- Check if this is the first user
  SELECT count(*) INTO user_count FROM public."User";
  
  -- Insert the new user into public.User
  INSERT INTO public."User" (id, email, name, "passwordHash", role, "updatedAt")
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'), 
    'supabase-auth', 
    CASE WHEN user_count = 0 THEN 'ADMIN' ELSE 'MEMBER' END,
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Alternatively (or additionally), allow users to insert their own profile via RLS
DROP POLICY IF EXISTS "Users can insert their own profile" ON "User";
CREATE POLICY "Users can insert their own profile" ON "User" FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. If you already have users in auth.users that are missing in public.User, 
-- you can run this to migrate them over:
INSERT INTO public."User" (id, email, name, "passwordHash", role, "updatedAt")
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'Unknown'), 
  'supabase-auth',
  'MEMBER',
  now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public."User");

