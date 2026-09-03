-- ==============================================================================
-- 🚀 SUPABASE CLOUD SQL SCHEMA & DATABASE MIGRATION SCRIPT
-- Master Database Setup for Sonu Choudhary 3D Portfolio & No-Code CMS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PORTFOLIO PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Sonu Choudhary',
    title TEXT NOT NULL DEFAULT 'Creative Technologist & Visual Director',
    roles JSONB NOT NULL DEFAULT '["3D Motion & VFX Artist", "UI/UX & Product Designer", "Graphics & Brand Identity Artist", "Full-Stack Web Developer", "Cinematic Video Editor"]'::jsonb,
    tagline TEXT NOT NULL DEFAULT 'Crafting immersive 3D digital experiences, cinematic visual effects, and high-conversion UI/UX interfaces.',
    bio TEXT NOT NULL,
    contact JSONB NOT NULL DEFAULT '{"phone1": "+91 8620028817", "phone2": "+91 8584866240", "whatsapp": "+91 8584866240", "email": "Sonu25580@gmail.com", "location": "Kolkata & Remote Worldwide", "availability": "Available for Select Freelance & Full-time Projects"}'::jsonb,
    socials JSONB NOT NULL DEFAULT '{"behance": "https://behance.net", "dribbble": "https://dribbble.com", "github": "https://github.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    avatar TEXT,
    hero_image TEXT,
    resume_url TEXT DEFAULT '#',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug_id TEXT UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- '3d-vfx', 'ui-ux', 'graphics', 'web-dev', 'vfx-video'
    subcategory TEXT,
    description TEXT,
    thumbnail TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT DEFAULT '',
    tags JSONB DEFAULT '[]'::jsonb,
    client TEXT,
    year TEXT,
    featured BOOLEAN DEFAULT false,
    link TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE PORTFOLIO SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug_id TEXT UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-cube',
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    starting_price TEXT,
    delivery_time TEXT,
    whatsapp_prefill TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE PORTFOLIO SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug_id TEXT UNIQUE,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 85,
    icon TEXT DEFAULT 'fa-code',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE PORTFOLIO EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug_id TEXT UNIQUE,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE PORTFOLIO REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug_id TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar TEXT,
    rating INTEGER DEFAULT 5,
    text TEXT NOT NULL,
    project TEXT,
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CREATE PORTFOLIO INQUIRIES TABLE (Leads / Contact CRM)
CREATE TABLE IF NOT EXISTS public.portfolio_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    budget TEXT,
    timeline TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New', -- 'New', 'In-Progress', 'Closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CREATE PORTFOLIO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_theme TEXT DEFAULT 'cyber-dark',
    primary_color TEXT DEFAULT '#6366f1',
    accent_color TEXT DEFAULT '#06b6d4',
    secondary_color TEXT DEFAULT '#ec4899',
    master_pin_hash TEXT DEFAULT '2558',
    particle_speed NUMERIC DEFAULT 0.8,
    particle_count INTEGER DEFAULT 80,
    enable_sound_fx BOOLEAN DEFAULT false,
    hero_mode TEXT DEFAULT 'dynamic-showcase',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ ACCESS (Allow anyone to view published portfolio data)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.portfolio_profile;
CREATE POLICY "Public profiles are viewable by everyone" ON public.portfolio_profile FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.portfolio_projects;
CREATE POLICY "Public projects are viewable by everyone" ON public.portfolio_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public services are viewable by everyone" ON public.portfolio_services;
CREATE POLICY "Public services are viewable by everyone" ON public.portfolio_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON public.portfolio_skills;
CREATE POLICY "Public skills are viewable by everyone" ON public.portfolio_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public experience is viewable by everyone" ON public.portfolio_experience;
CREATE POLICY "Public experience is viewable by everyone" ON public.portfolio_experience FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.portfolio_reviews;
CREATE POLICY "Public reviews are viewable by everyone" ON public.portfolio_reviews FOR SELECT USING (approved = true);

DROP POLICY IF EXISTS "Public settings are viewable by everyone" ON public.portfolio_settings;
CREATE POLICY "Public settings are viewable by everyone" ON public.portfolio_settings FOR SELECT USING (true);

-- 2. PUBLIC INSERTS FOR INQUIRIES (Allow clients to submit project inquiries)
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.portfolio_inquiries;
CREATE POLICY "Anyone can submit an inquiry" ON public.portfolio_inquiries FOR INSERT WITH CHECK (true);

-- 3. ADMIN / AUTHENTICATED FULL ACCESS (Allow logged-in admin full CRUD)
DROP POLICY IF EXISTS "Admin has full access to profile" ON public.portfolio_profile;
CREATE POLICY "Admin has full access to profile" ON public.portfolio_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to projects" ON public.portfolio_projects;
CREATE POLICY "Admin has full access to projects" ON public.portfolio_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to services" ON public.portfolio_services;
CREATE POLICY "Admin has full access to services" ON public.portfolio_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to skills" ON public.portfolio_skills;
CREATE POLICY "Admin has full access to skills" ON public.portfolio_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to experience" ON public.portfolio_experience;
CREATE POLICY "Admin has full access to experience" ON public.portfolio_experience FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to reviews" ON public.portfolio_reviews;
CREATE POLICY "Admin has full access to reviews" ON public.portfolio_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to inquiries" ON public.portfolio_inquiries;
CREATE POLICY "Admin has full access to inquiries" ON public.portfolio_inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to settings" ON public.portfolio_settings;
CREATE POLICY "Admin has full access to settings" ON public.portfolio_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. PUBLIC ANON KEY DIRECT UPDATE POLICIES
DROP POLICY IF EXISTS "Anon direct update with Master PIN verified via client" ON public.portfolio_profile;
CREATE POLICY "Anon direct update with Master PIN verified via client" ON public.portfolio_profile FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update projects" ON public.portfolio_projects;
CREATE POLICY "Anon direct update projects" ON public.portfolio_projects FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update services" ON public.portfolio_services;
CREATE POLICY "Anon direct update services" ON public.portfolio_services FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update skills" ON public.portfolio_skills;
CREATE POLICY "Anon direct update skills" ON public.portfolio_skills FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update experience" ON public.portfolio_experience;
CREATE POLICY "Anon direct update experience" ON public.portfolio_experience FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update reviews" ON public.portfolio_reviews;
CREATE POLICY "Anon direct update reviews" ON public.portfolio_reviews FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update inquiries" ON public.portfolio_inquiries;
CREATE POLICY "Anon direct update inquiries" ON public.portfolio_inquiries FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon direct update settings" ON public.portfolio_settings;
CREATE POLICY "Anon direct update settings" ON public.portfolio_settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- ==============================================================================
-- ⚡ SUPABASE REALTIME BROADCAST CONFIGURATION
-- ==============================================================================
BEGIN;
  -- Drop publication if exists and recreate with all tables
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.portfolio_profile,
    public.portfolio_projects,
    public.portfolio_services,
    public.portfolio_skills,
    public.portfolio_experience,
    public.portfolio_reviews,
    public.portfolio_inquiries,
    public.portfolio_settings;
COMMIT;

-- ==============================================================================
-- 📦 STORAGE BUCKET CREATION (FOR MEDIA UPLOADS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to portfolio media" ON storage.objects;
CREATE POLICY "Public Access to portfolio media" 
ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Public Upload to portfolio media" ON storage.objects;
CREATE POLICY "Public Upload to portfolio media" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Public Update to portfolio media" ON storage.objects;
CREATE POLICY "Public Update to portfolio media" 
ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Public Delete to portfolio media" ON storage.objects;
CREATE POLICY "Public Delete to portfolio media" 
ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-media');

-- ==============================================================================
-- 🌟 SEED DATA INITIALIZATION FOR SONU CHOUDHARY
-- ==============================================================================

-- Seed Profile
INSERT INTO public.portfolio_profile (name, title, roles, tagline, bio, contact, socials, avatar, hero_image)
VALUES (
    'Sonu Choudhary',
    'Creative Technologist & Visual Director',
    '["3D Motion & VFX Artist", "UI/UX & Product Designer", "Graphics & Brand Identity Artist", "Full-Stack Web Developer", "Cinematic Video Editor"]'::jsonb,
    'Crafting immersive 3D digital experiences, cinematic visual effects, and high-conversion UI/UX interfaces.',
    'I am a multi-disciplinary Creative Technologist with over 6+ years of industry experience blending high-end 3D motion design, cutting-edge VFX, human-centered UI/UX design, and robust modern web engineering. I transform bold ideas into breathtaking visual realities that captivate audiences and drive measurable business growth.',
    '{"phone1": "+91 8620028817", "phone2": "+91 8584866240", "whatsapp": "+91 8584866240", "email": "Sonu25580@gmail.com", "location": "Kolkata & Remote Worldwide", "availability": "Available for Select Freelance & Full-time Projects"}'::jsonb,
    '{"behance": "https://behance.net", "dribbble": "https://dribbble.com", "github": "https://github.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
) ON CONFLICT DO NOTHING;

-- Seed Settings
INSERT INTO public.portfolio_settings (current_theme, primary_color, accent_color, secondary_color, master_pin_hash, particle_speed, particle_count)
VALUES ('cyber-dark', '#6366f1', '#06b6d4', '#ec4899', '2558', 0.8, 80)
ON CONFLICT DO NOTHING;
