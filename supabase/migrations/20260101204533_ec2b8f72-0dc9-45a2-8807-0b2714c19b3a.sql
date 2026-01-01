-- Allow parents to insert into child_auth (for creating their children's credentials)
CREATE POLICY "Parents can insert child_auth for their linked children"
ON public.child_auth
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = child_auth.user_id
  )
);

-- Allow parents to update their linked children's child_auth (for PIN reset)
CREATE POLICY "Parents can update child_auth for their linked children"
ON public.child_auth
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = child_auth.user_id
  )
);

-- Allow parents to insert parent_child_links for their own children
CREATE POLICY "Parents can insert their own links"
ON public.parent_child_links
FOR INSERT
WITH CHECK (auth.uid() = parent_id);

-- Allow parents to insert child_profiles for their linked children
CREATE POLICY "Parents can insert child profiles for their children"
ON public.child_profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = child_profiles.user_id
  )
);

-- Allow parents to view their linked children's child_auth (for viewing username)
CREATE POLICY "Parents can view child_auth for their linked children"
ON public.child_auth
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = child_auth.user_id
  )
);

-- Allow parents to view their linked children's profiles
CREATE POLICY "Parents can view linked children profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = profiles.user_id
  )
);

-- Allow parents to view their linked children's child_profiles
CREATE POLICY "Parents can view child profiles for their children"
ON public.child_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_child_links.parent_id = auth.uid()
      AND parent_child_links.child_id = child_profiles.user_id
  )
);