-- Add status column to profiles for tracking account states
ALTER TABLE public.profiles 
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Create child activation codes table
CREATE TABLE public.child_activation_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  child_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_activation_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage activation codes
CREATE POLICY "Admins can manage activation codes"
ON public.child_activation_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create parent link requests table (for pending child links)
CREATE TABLE public.parent_link_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_code text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parent_link_requests ENABLE ROW LEVEL SECURITY;

-- Admins can manage all link requests
CREATE POLICY "Admins can manage link requests"
ON public.parent_link_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Parents can view their own requests
CREATE POLICY "Parents can view their own requests"
ON public.parent_link_requests
FOR SELECT
USING (auth.uid() = parent_id);

-- Parents can insert their own requests
CREATE POLICY "Parents can insert their own requests"
ON public.parent_link_requests
FOR INSERT
WITH CHECK (auth.uid() = parent_id);

-- Function to generate unique child code
CREATE OR REPLACE FUNCTION public.generate_child_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate code like TCC-XXXXX (5 alphanumeric chars)
    new_code := 'TCC-' || upper(substring(md5(random()::text) from 1 for 5));
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM child_activation_codes WHERE code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Update handle_new_user to set status based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role app_role;
  user_status text;
BEGIN
  -- Determine role from metadata
  user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'child');
  
  -- Set status based on role
  IF user_role = 'parent' THEN
    user_status := 'pending';
  ELSIF user_role = 'child' THEN
    user_status := 'inactive';
  ELSE
    user_status := 'active';
  END IF;
  
  -- Create profile with status
  INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    user_status
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;