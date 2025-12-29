-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('child', 'parent', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'child',
  UNIQUE (user_id, role)
);

-- Create child_profiles table for child-specific data
CREATE TABLE public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  group_class TEXT,
  grade_age TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent_child_links table for parent-child relationships
CREATE TABLE public.parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id)
);

-- Create daily_logs table for tracking ibadah
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  
  -- Quran section
  quran_pages INTEGER NOT NULL DEFAULT 0,
  quran_surah TEXT,
  quran_ayah_range TEXT,
  quran_notes TEXT,
  
  -- Islamic book section
  book_title TEXT,
  book_pages INTEGER NOT NULL DEFAULT 0,
  
  -- Prayers (Farz, Sunnah, OnTime for each)
  prayer_fajr_farz BOOLEAN NOT NULL DEFAULT false,
  prayer_fajr_sunnah BOOLEAN NOT NULL DEFAULT false,
  prayer_fajr_on_time BOOLEAN DEFAULT false,
  
  prayer_dhuhr_farz BOOLEAN NOT NULL DEFAULT false,
  prayer_dhuhr_sunnah BOOLEAN NOT NULL DEFAULT false,
  prayer_dhuhr_on_time BOOLEAN DEFAULT false,
  
  prayer_asr_farz BOOLEAN NOT NULL DEFAULT false,
  prayer_asr_sunnah BOOLEAN NOT NULL DEFAULT false,
  prayer_asr_on_time BOOLEAN DEFAULT false,
  
  prayer_maghrib_farz BOOLEAN NOT NULL DEFAULT false,
  prayer_maghrib_sunnah BOOLEAN NOT NULL DEFAULT false,
  prayer_maghrib_on_time BOOLEAN DEFAULT false,
  
  prayer_isha_farz BOOLEAN NOT NULL DEFAULT false,
  prayer_isha_sunnah BOOLEAN NOT NULL DEFAULT false,
  prayer_isha_on_time BOOLEAN DEFAULT false,
  
  witr BOOLEAN NOT NULL DEFAULT false,
  jumuah BOOLEAN NOT NULL DEFAULT false,
  
  -- Dhikr section
  dhikr_subhan_allah INTEGER NOT NULL DEFAULT 0,
  dhikr_alhamdulillah INTEGER NOT NULL DEFAULT 0,
  dhikr_allahu_akbar INTEGER NOT NULL DEFAULT 0,
  dhikr_salawat INTEGER NOT NULL DEFAULT 0,
  dhikr_other_label TEXT,
  dhikr_other_count INTEGER DEFAULT 0,
  
  -- Memorization & Review
  memorization_count INTEGER DEFAULT 0,
  memorization_details TEXT,
  review_details TEXT,
  
  -- Good deed
  good_deed TEXT,
  notes TEXT,
  
  -- Admin audit trail
  edited_by_admin BOOLEAN NOT NULL DEFAULT false,
  edited_by_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Only one log per child per date
  UNIQUE (child_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Child profiles policies
CREATE POLICY "Children can view their own child profile"
  ON public.child_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage child profiles"
  ON public.child_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Parent-child links policies
CREATE POLICY "Parents can view their own links"
  ON public.parent_child_links FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Children can view links to them"
  ON public.parent_child_links FOR SELECT
  USING (auth.uid() = child_id);

CREATE POLICY "Admins can manage all links"
  ON public.parent_child_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Daily logs policies
CREATE POLICY "Children can view their own logs"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = child_id);

CREATE POLICY "Children can insert their own logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can update their own logs"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = child_id AND edited_by_admin = false);

CREATE POLICY "Parents can view linked children logs"
  ON public.daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_links
      WHERE parent_id = auth.uid() AND child_id = daily_logs.child_id
    )
  );

CREATE POLICY "Admins can view all logs"
  ON public.daily_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all logs"
  ON public.daily_logs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  
  -- Assign default role (child) - can be changed by admin later
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'child'));
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();