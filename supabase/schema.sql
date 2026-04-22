-- Astroshot CMS Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('VFX', 'Social Media', 'Branding', '3D Animation')),
  description TEXT,
  thumbnail_url TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read published projects
CREATE POLICY "Public read published"
  ON projects
  FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users have full access
CREATE POLICY "Auth full access"
  ON projects
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Storage buckets (create via Supabase Dashboard or CLI)
-- Bucket: thumbnails (public)
-- Bucket: media (public)
-- Bucket: project-images (public) [NEW]
-- Bucket: blog-covers (public) [NEW]
-- Bucket: client-logos (public) [NEW]

-- Insert policy for storage
-- Allow authenticated users to upload to both buckets
-- Allow public read access

-- ============================================================
-- EXPANDED CMS SCHEMA
-- ============================================================

-- Site copy / text content (editable from dashboard)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  section TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  service TEXT,
  message TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Client logos
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Project images (multiple images per project)
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for new tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Auth write site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON services FOR SELECT USING (active = true);
CREATE POLICY "Auth write services" ON services FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blogs" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Auth write blogs" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read contact" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (active = true);
CREATE POLICY "Auth write clients" ON clients FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);
CREATE POLICY "Auth write project_images" ON project_images FOR ALL USING (auth.role() = 'authenticated');

-- Auto-update triggers for new tables
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Default site content seed
INSERT INTO site_content (key, value, label, section) VALUES
  ('hero_headline', 'We Make Brands Impossible to Ignore', 'Hero Headline', 'hero'),
  ('hero_subtext', 'VFX · CGI · Social Media · Branding — Kuwait & GCC', 'Hero Subtext', 'hero'),
  ('about_headline', 'Astroshot is Kuwait''s most ambitious creative agency.', 'About Headline', 'about'),
  ('about_body', 'We don''t just make content — we engineer cultural moments. From VFX and CGI to social media strategy and full-scale brand buildouts, every project is built to stop the scroll and grow the brand.', 'About Body', 'about'),
  ('cta_headline', 'Ready to make your brand impossible to ignore?', 'CTA Headline', 'cta'),
  ('footer_tagline', 'Kuwait''s leading VFX, CGI, and creative marketing agency. 500M+ organic views across the GCC.', 'Footer Tagline', 'footer')
ON CONFLICT (key) DO NOTHING;
