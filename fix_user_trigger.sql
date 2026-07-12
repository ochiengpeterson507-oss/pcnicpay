-- Create a function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  -- Check if this is the first user
  SELECT count(*) INTO user_count FROM public."User";
  
  -- Insert into public.User
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Also, add an INSERT policy just in case the client attempts to insert it.
-- This will prevent the client insert from failing if they still try.
DROP POLICY IF EXISTS "Users can insert their own profile" ON "User";
CREATE POLICY "Users can insert their own profile" ON "User" FOR INSERT WITH CHECK (auth.uid() = id);

