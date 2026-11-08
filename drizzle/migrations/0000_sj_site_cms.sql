-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Owner email gets admin once their email is confirmed
CREATE OR REPLACE FUNCTION public.assign_owner_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'sjinfo7288@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_owner_role
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_owner_role();

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_title text NOT NULL DEFAULT 'SJ Photography and Cinematic',
  tagline text NOT NULL DEFAULT '',
  hero_title text NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  welcome_title text NOT NULL DEFAULT '',
  welcome_text text NOT NULL DEFAULT '',
  about_text text NOT NULL DEFAULT '',
  footer_text text NOT NULL DEFAULT '',
  logo_url text,
  hero_background_url text,
  featured_video_url text,
  mobile text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Galleries
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Photos
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.galleries(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  url text NOT NULL,
  storage_path text,
  in_slider boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Videos
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  url text NOT NULL,
  storage_path text,
  source text NOT NULL DEFAULT 'upload',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'camera',
  image_url text,
  storage_path text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Offers
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_percent int NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  valid_until date,
  image_url text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['galleries','photos','videos','services','offers'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Anyone can read %1$s" ON public.%1$I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Owner can insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE POLICY "Owner can update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE POLICY "Owner can delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

-- Seed content
INSERT INTO public.site_settings (id, site_title, tagline, hero_title, hero_subtitle, welcome_title, welcome_text, about_text, footer_text, logo_url, hero_background_url, featured_video_url, mobile, whatsapp, email, instagram)
VALUES (1,
  'SJ Photography and Cinematic',
  'Photography · Cinematography · Drone',
  'Stories told in light & gold',
  'Luxury photography and cinematic films for the moments you will want to relive forever.',
  'Welcome to SJ Photography and Cinematic',
  'From the glow of a maternity shoot to the sweep of a drone over your wedding venue, we capture every frame with a cinematic eye. Every story deserves to be remembered beautifully — let us tell yours.',
  'We are a passionate team of photographers and filmmakers creating timeless images and films for weddings, maternity, birthdays and every celebration in between.',
  'Capturing timeless moments with a cinematic touch.',
  '/__l5e/assets-v1/c7c683c9-e42b-45b9-a1a3-1d0e5efadb4c/sj_logo.jpg',
  '/__l5e/assets-v1/8510f0a0-fb1e-4424-ad5c-ad8f92555b1b/wedding_portrait.jpg',
  '/__l5e/assets-v1/b8969fd5-25f0-4db0-8e7a-57e50193bece/sj_showreel.mp4',
  '9767793006', '919767793006', 'SJinfo7288@gmail.com', 'sj_photography7288');

INSERT INTO public.galleries (id, name, description, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Weddings & Couples', 'Royal weddings and romantic couple portraits.', 1),
  ('a1000000-0000-4000-8000-000000000002', 'Maternity', 'Graceful portraits celebrating motherhood.', 2),
  ('a1000000-0000-4000-8000-000000000003', 'Birthdays', 'Joyful birthday moments and themed setups.', 3),
  ('a1000000-0000-4000-8000-000000000004', 'Drone & Venues', 'Breathtaking aerial views of venues and events.', 4);

INSERT INTO public.photos (gallery_id, title, url, in_slider, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Royal Wedding Portrait', '/__l5e/assets-v1/8510f0a0-fb1e-4424-ad5c-ad8f92555b1b/wedding_portrait.jpg', true, 1),
  ('a1000000-0000-4000-8000-000000000001', 'Golden Hour Couple', '/__l5e/assets-v1/0d0835a7-44fb-41b5-898f-41c2eba85359/couple_portrait.jpg', true, 2),
  ('a1000000-0000-4000-8000-000000000002', 'Lavender Maternity', '/__l5e/assets-v1/19c7924d-ecb5-4e98-acb9-adbae13b96e9/maternity_portrait.jpg', true, 3),
  ('a1000000-0000-4000-8000-000000000004', 'Venue From Above', '/__l5e/assets-v1/b4bb509a-59d4-49d6-b30a-b8af90d11a00/drone_venue.jpg', true, 4),
  ('a1000000-0000-4000-8000-000000000003', 'Birthday Celebration', '/__l5e/assets-v1/4c7db913-f600-433c-9e42-7214e092289b/birthday_portrait.jpg', true, 5);

INSERT INTO public.videos (title, url, source, sort_order) VALUES
  ('SJ Cinematic Showreel', '/__l5e/assets-v1/b8969fd5-25f0-4db0-8e7a-57e50193bece/sj_showreel.mp4', 'upload', 1);

INSERT INTO public.services (title, description, icon, image_url, sort_order) VALUES
  ('Maternity Photography', 'Elegant, graceful portraits that celebrate the beauty of motherhood — flowing gowns, natural light and timeless poses.', 'baby', '/__l5e/assets-v1/19c7924d-ecb5-4e98-acb9-adbae13b96e9/maternity_portrait.jpg', 1),
  ('Birthday Photography', 'Colourful, candid coverage of birthday parties and themed shoots, from first birthdays to milestone celebrations.', 'cake', '/__l5e/assets-v1/4c7db913-f600-433c-9e42-7214e092289b/birthday_portrait.jpg', 2),
  ('Drone Photography', 'Stunning aerial photos and video of venues, decor and grand entries from a bird''s-eye view.', 'drone', '/__l5e/assets-v1/b4bb509a-59d4-49d6-b30a-b8af90d11a00/drone_venue.jpg', 3),
  ('Cinematography', 'Cinematic wedding films, teasers and highlight reels edited with music, colour and emotion.', 'clapperboard', '/__l5e/assets-v1/8510f0a0-fb1e-4424-ad5c-ad8f92555b1b/wedding_portrait.jpg', 4),
  ('All Types of Photography', 'Weddings, pre-weddings, engagements, events, portraits and more — tell us your occasion and we will capture it.', 'camera', '/__l5e/assets-v1/0d0835a7-44fb-41b5-898f-41c2eba85359/couple_portrait.jpg', 5);
