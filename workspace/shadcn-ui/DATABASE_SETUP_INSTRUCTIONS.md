# Database Setup Instructions for Hatch Platform

## Problem
The admin bootstrap system requires a `profiles` table that doesn't exist in your Supabase database yet.

## Solution
Follow these steps to create the required database structure:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)

### Step 2: Run the Database Setup SQL
Copy and paste the following SQL commands into the SQL Editor and click **Run**:

```sql
-- Create profiles table for user role management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'broker', 'admin')),
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        'customer'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
```

### Step 3: Verify Table Creation
After running the SQL, you should see:
- ✅ Table `public.profiles` created
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ Triggers created

### Step 4: Test Admin Bootstrap
1. Navigate to `/admin/bootstrap` in your app
2. Enter your credentials:
   - Email: `apexsquad7@gmail.com`
   - Password: `Testing21??`
3. Click "Create Admin Account"
4. You should be redirected to `/admin` panel

### Step 5: Verify Admin Access
Once logged in as admin, you should be able to:
- Access the admin panel at `/admin`
- Grant broker privileges to other users
- Manage the broker role system

## What This Creates
- **profiles table**: Stores user information and roles
- **RLS policies**: Secure access control
- **Automatic triggers**: Create profiles for new users
- **Role management**: Support for customer/agent/broker/admin roles

## Troubleshooting
If you encounter any issues:
1. Check that all SQL commands ran successfully
2. Verify the `profiles` table exists in your database
3. Ensure RLS policies are active
4. Try the admin bootstrap process again

## Next Steps
After successful database setup:
1. Create your admin account via `/admin/bootstrap`
2. Use the admin panel to grant broker privileges
3. Test the complete broker management system