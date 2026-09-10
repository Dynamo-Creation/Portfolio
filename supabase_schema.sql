-- ==============================================================================
-- 🚀 SUPABASE CLOUD SQL SCHEMA & REALTIME CONFIGURATION
-- Master Database Setup for Sonu Choudhary Portfolio & Realtime CMS
-- ==============================================================================

-- 1. Create portfolio_data table (Centralized Realtime Key-Value Store)
CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create visitor reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT '',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create contact messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Set RLS Policies (Public Read & Authenticated/Public Write)
DROP POLICY IF EXISTS "Public Read Portfolio Data" ON public.portfolio_data;
CREATE POLICY "Public Read Portfolio Data" ON public.portfolio_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Write Portfolio Data" ON public.portfolio_data;
CREATE POLICY "Public Write Portfolio Data" ON public.portfolio_data FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Messages" ON public.messages;
CREATE POLICY "Public Read Messages" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Messages" ON public.messages;
CREATE POLICY "Public Insert Messages" ON public.messages FOR INSERT WITH CHECK (true);

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- 7. Optional Storage Bucket Setup for 'portfolio-media'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Media Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Public Media Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-media');
