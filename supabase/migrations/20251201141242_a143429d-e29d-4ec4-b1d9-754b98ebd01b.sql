-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all holdings
CREATE POLICY "Admins can view all holdings"
ON public.holdings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert holdings for any user
CREATE POLICY "Admins can insert any holdings"
ON public.holdings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any holdings
CREATE POLICY "Admins can update any holdings"
ON public.holdings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any holdings
CREATE POLICY "Admins can delete any holdings"
ON public.holdings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));