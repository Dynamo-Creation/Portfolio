-- ==============================================================================
-- 🚀 SUPABASE CLOUD MASTER SQL SCHEMA & REALTIME CONFIGURATION
-- Master Database Setup for Sonu Choudhary Portfolio & Realtime CMS
-- ==============================================================================

-- 1. Create portfolio_data table (Centralized Realtime Key-Value Store)
CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create profile & socials table
CREATE TABLE IF NOT EXISTS public.portfolio_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT,
    roles JSONB DEFAULT '[]'::jsonb,
    tagline TEXT,
    bio TEXT,
    contact JSONB DEFAULT '{}'::jsonb,
    socials JSONB DEFAULT '{}'::jsonb,
    avatar TEXT,
    hero_image TEXT,
    resume_url TEXT DEFAULT '#',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create settings & theme table
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_theme TEXT DEFAULT 'cyber-dark',
    primary_color TEXT DEFAULT '#6366f1',
    accent_color TEXT DEFAULT '#06b6d4',
    secondary_color TEXT DEFAULT '#ec4899',
    master_pin_hash TEXT,
    particle_speed NUMERIC DEFAULT 0.8,
    particle_count INTEGER DEFAULT 80,
    hero_mode TEXT DEFAULT 'dynamic-showcase',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    description TEXT,
    thumbnail TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    client TEXT,
    year TEXT,
    featured BOOLEAN DEFAULT false,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create services table
CREATE TABLE IF NOT EXISTS public.portfolio_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    icon TEXT DEFAULT 'fa-cube',
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    starting_price TEXT,
    delivery_time TEXT,
    whatsapp_prefill TEXT,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create skills table
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    level INTEGER DEFAULT 85,
    icon TEXT DEFAULT 'fa-code',
    display_order INTEGER DEFAULT 0
);

-- 7. Create experience table
CREATE TABLE IF NOT EXISTS public.portfolio_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0
);

-- 8. Create portfolio reviews table
CREATE TABLE IF NOT EXISTS public.portfolio_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar TEXT,
    rating INTEGER DEFAULT 5,
    text TEXT NOT NULL,
    project TEXT,
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Create client inquiries table
CREATE TABLE IF NOT EXISTS public.portfolio_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    budget TEXT,
    timeline TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Create visitor reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT '',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create contact messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies (Allow Read & Write for CMS and Portfolio Visitors)
DROP POLICY IF EXISTS "Public Read portfolio_data" ON public.portfolio_data;
CREATE POLICY "Public Read portfolio_data" ON public.portfolio_data FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_data" ON public.portfolio_data;
CREATE POLICY "Public Write portfolio_data" ON public.portfolio_data FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_profile" ON public.portfolio_profile;
CREATE POLICY "Public Read portfolio_profile" ON public.portfolio_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_profile" ON public.portfolio_profile;
CREATE POLICY "Public Write portfolio_profile" ON public.portfolio_profile FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_settings" ON public.portfolio_settings;
CREATE POLICY "Public Read portfolio_settings" ON public.portfolio_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_settings" ON public.portfolio_settings;
CREATE POLICY "Public Write portfolio_settings" ON public.portfolio_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_projects" ON public.portfolio_projects;
CREATE POLICY "Public Read portfolio_projects" ON public.portfolio_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_projects" ON public.portfolio_projects;
CREATE POLICY "Public Write portfolio_projects" ON public.portfolio_projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_services" ON public.portfolio_services;
CREATE POLICY "Public Read portfolio_services" ON public.portfolio_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_services" ON public.portfolio_services;
CREATE POLICY "Public Write portfolio_services" ON public.portfolio_services FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_skills" ON public.portfolio_skills;
CREATE POLICY "Public Read portfolio_skills" ON public.portfolio_skills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_skills" ON public.portfolio_skills;
CREATE POLICY "Public Write portfolio_skills" ON public.portfolio_skills FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_experience" ON public.portfolio_experience;
CREATE POLICY "Public Read portfolio_experience" ON public.portfolio_experience FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_experience" ON public.portfolio_experience;
CREATE POLICY "Public Write portfolio_experience" ON public.portfolio_experience FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_reviews" ON public.portfolio_reviews;
CREATE POLICY "Public Read portfolio_reviews" ON public.portfolio_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_reviews" ON public.portfolio_reviews;
CREATE POLICY "Public Write portfolio_reviews" ON public.portfolio_reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read portfolio_inquiries" ON public.portfolio_inquiries;
CREATE POLICY "Public Read portfolio_inquiries" ON public.portfolio_inquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write portfolio_inquiries" ON public.portfolio_inquiries;
CREATE POLICY "Public Write portfolio_inquiries" ON public.portfolio_inquiries FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Messages" ON public.messages;
CREATE POLICY "Public Read Messages" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Messages" ON public.messages;
CREATE POLICY "Public Insert Messages" ON public.messages FOR ALL USING (true);

-- ==============================================================================
-- ⚡ REALTIME PUBLICATIONS (Broadcast updates live to visitor browsers)
-- ==============================================================================
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_data; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_profile; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_projects; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_services; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_skills; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_experience; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_reviews; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_inquiries; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_settings; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- ==============================================================================
-- 📁 STORAGE BUCKET SETUP ('portfolio-media')
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Media Read" ON storage.objects;
CREATE POLICY "Public Media Read" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Public Media Insert" ON storage.objects;
CREATE POLICY "Public Media Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Public Media Update" ON storage.objects;
CREATE POLICY "Public Media Update" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-media');
