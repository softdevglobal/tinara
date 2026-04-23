
-- =========================================
-- ENUM: app roles
-- =========================================
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'finance', 'staff', 'viewer');

-- =========================================
-- TABLE: organisations
-- =========================================
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  currency TEXT NOT NULL DEFAULT 'AUD',
  timezone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  logo_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- TABLE: profiles (mirrors auth.users)
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  default_organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- TABLE: team_memberships
-- =========================================
CREATE TABLE public.team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'staff',
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);

CREATE INDEX idx_team_memberships_user ON public.team_memberships(user_id);
CREATE INDEX idx_team_memberships_org ON public.team_memberships(organisation_id);

-- =========================================
-- FUNCTIONS (security definer, no recursion)
-- =========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = _user_id
      AND organisation_id = _org_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = _user_id AND organisation_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = _user_id
      AND organisation_id = _org_id
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID, _org_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.team_memberships
  WHERE user_id = _user_id AND organisation_id = _org_id
  LIMIT 1;
$$;

-- =========================================
-- updated_at trigger function
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organisations_updated
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_team_memberships_updated
  BEFORE UPDATE ON public.team_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- RLS
-- =========================================
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- organisations policies
CREATE POLICY "Members can view their organisations"
  ON public.organisations FOR SELECT
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create organisations"
  ON public.organisations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their organisation"
  ON public.organisations FOR UPDATE
  USING (public.is_org_admin(auth.uid(), id));

CREATE POLICY "Owners can delete their organisation"
  ON public.organisations FOR DELETE
  USING (public.has_role(auth.uid(), id, 'owner'));

-- team_memberships policies
CREATE POLICY "Members can view memberships in their orgs"
  ON public.team_memberships FOR SELECT
  USING (public.is_org_member(auth.uid(), organisation_id));

CREATE POLICY "Admins can add members to their org"
  ON public.team_memberships FOR INSERT
  WITH CHECK (public.is_org_admin(auth.uid(), organisation_id));

CREATE POLICY "Admins can update memberships in their org"
  ON public.team_memberships FOR UPDATE
  USING (public.is_org_admin(auth.uid(), organisation_id));

CREATE POLICY "Admins can remove members from their org"
  ON public.team_memberships FOR DELETE
  USING (public.is_org_admin(auth.uid(), organisation_id));

-- Allow a user to insert themselves as the first owner of an org they just created
CREATE POLICY "Users can insert their own first owner membership"
  ON public.team_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'owner');

-- =========================================
-- Auto-provision profile + personal org + owner membership on signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  default_name TEXT;
BEGIN
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.organisations (name, currency, created_by)
  VALUES (default_name || '''s Workspace', 'AUD', NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, email, display_name, default_organisation_id)
  VALUES (NEW.id, NEW.email, default_name, new_org_id);

  INSERT INTO public.team_memberships (organisation_id, user_id, role, invited_by)
  VALUES (new_org_id, NEW.id, 'owner', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
