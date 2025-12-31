-- Create child_auth table for username + PIN login
CREATE TABLE public.child_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  pin_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on child_auth
ALTER TABLE public.child_auth ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_auth
CREATE POLICY "Admins can manage child_auth"
ON public.child_auth
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Children can view their own auth"
ON public.child_auth
FOR SELECT
USING (auth.uid() = user_id);

-- Create admin_tokens table for token-based admin login
CREATE TABLE public.admin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on admin_tokens
ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- Only existing admins can manage admin tokens
CREATE POLICY "Admins can manage admin_tokens"
ON public.admin_tokens
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create temp_login_codes table for child temporary codes
CREATE TABLE public.temp_login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on temp_login_codes
ALTER TABLE public.temp_login_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage temp codes
CREATE POLICY "Admins can manage temp_login_codes"
ON public.temp_login_codes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Parents can create/view temp codes for their linked children
CREATE POLICY "Parents can manage temp codes for their children"
ON public.temp_login_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
    AND parent_child_links.child_id = temp_login_codes.child_user_id
  )
);

-- Function to hash PIN (simple for now, use proper hashing in production)
CREATE OR REPLACE FUNCTION public.hash_pin(pin TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(sha256(pin::bytea), 'hex');
END;
$$;

-- Function to verify child PIN login
CREATE OR REPLACE FUNCTION public.verify_child_login(p_username TEXT, p_pin TEXT)
RETURNS TABLE(user_id UUID, is_valid BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_auth RECORD;
  v_pin_hash TEXT;
BEGIN
  -- Get child auth record
  SELECT ca.*, p.status 
  INTO v_child_auth
  FROM child_auth ca
  JOIN profiles p ON p.user_id = ca.user_id
  WHERE ca.username = LOWER(p_username);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Kullanıcı adı bulunamadı.'::TEXT;
    RETURN;
  END IF;
  
  -- Check if account is locked
  IF v_child_auth.locked_until IS NOT NULL AND v_child_auth.locked_until > now() THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.'::TEXT;
    RETURN;
  END IF;
  
  -- Check if account is active
  IF v_child_auth.status != 'active' THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Hesap aktif değil.'::TEXT;
    RETURN;
  END IF;
  
  -- Verify PIN
  v_pin_hash := public.hash_pin(p_pin);
  
  IF v_child_auth.pin_hash = v_pin_hash THEN
    -- Reset failed attempts on success
    UPDATE child_auth 
    SET failed_attempts = 0, locked_until = NULL 
    WHERE username = LOWER(p_username);
    
    RETURN QUERY SELECT v_child_auth.user_id, TRUE, NULL::TEXT;
  ELSE
    -- Increment failed attempts
    UPDATE child_auth 
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE 
          WHEN failed_attempts >= 4 THEN now() + interval '5 minutes'
          ELSE NULL
        END
    WHERE username = LOWER(p_username);
    
    RETURN QUERY SELECT NULL::UUID, FALSE, 'PIN hatalı. Lütfen tekrar deneyin.'::TEXT;
  END IF;
END;
$$;

-- Function to verify admin token
CREATE OR REPLACE FUNCTION public.verify_admin_token(p_token TEXT)
RETURNS TABLE(admin_email TEXT, admin_name TEXT, is_valid BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_hash TEXT;
  v_admin RECORD;
BEGIN
  v_token_hash := encode(sha256(p_token::bytea), 'hex');
  
  SELECT * INTO v_admin
  FROM admin_tokens
  WHERE token_hash = v_token_hash AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, FALSE, 'Geçersiz yönetici token.'::TEXT;
    RETURN;
  END IF;
  
  -- Update last used
  UPDATE admin_tokens SET last_used_at = now() WHERE id = v_admin.id;
  
  RETURN QUERY SELECT v_admin.email, v_admin.name, TRUE, NULL::TEXT;
END;
$$;

-- Generate initial admin token (you'll get this in the response)
-- Token: TCC-ADMIN-2024-SECURE
INSERT INTO admin_tokens (token_hash, email, name, is_active)
VALUES (
  encode(sha256('TCC-ADMIN-2024-SECURE'::bytea), 'hex'),
  'admin@tcc.org',
  'TCC Admin',
  true
);