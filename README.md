# Astroshot Website

Official website for **Astroshot Project Management Company** — Kuwait's leading VFX, CGI, and creative marketing agency.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Three.js** + @react-three/fiber + @react-three/drei
- **GSAP** + @gsap/react (scroll animations)
- **Framer Motion** (UI animations)
- **Tailwind CSS v4**
- **Supabase** (database + auth + storage)
- **Google Fonts**: Montserrat

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. In **Storage**, create two public buckets:
   - `thumbnails`
   - `media`
4. Set bucket policies to allow authenticated uploads and public reads

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Find these in Supabase → Project Settings → API.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create admin user

In Supabase → Authentication → Users, click **Invite User** and enter your email. Set a password via the invite link.

## Admin Dashboard

Visit `/admin/login` to sign in. The dashboard provides:

- **Upload Project** — Upload title, category, description, thumbnail image, media (image or video), featured toggle, draft/published status
- **Projects List** — View all projects, toggle published/draft, delete

Projects are stored in Supabase with files in the `thumbnails` and `media` storage buckets.

## Deploying to Vercel

1. Push this repo to GitHub
2. Import to [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Hero Video

Replace `/public/hero-reel.mp4` with your actual showreel. The video is set to autoplay, muted, looped with `object-cover` fill.

## Site Structure

```
app/
  page.tsx              Homepage (Hero, Services, Portfolio, Stats, About, Marquee, CTA)
  portfolio/page.tsx    Portfolio grid with category filters + Supabase data
  services/page.tsx     Detailed services with SEO copy
  about/page.tsx        Company story, stats, clients, office
  contact/page.tsx      Contact form + info
  admin/page.tsx        CMS dashboard (protected)
  admin/login/page.tsx  Admin login

components/
  Navbar.tsx            Transparent → white on scroll, mobile hamburger
  Footer.tsx            Dark footer with links and contact
  ProjectCard.tsx       Portfolio card with hover video
  AnimatedCounter.tsx   GSAP scroll-triggered number counter
  Marquee.tsx           Infinite scrolling client names
  sections/             Homepage section components

lib/
  supabase.ts           Supabase client + Project type
supabase/
  schema.sql            Database schema with RLS policies
public/
  hero-reel.mp4         (Replace with actual video)
  llms.txt              AI crawler info
```

## Brand Colors

| Token | Value |
|-------|-------|
| Green | `#01F17C` |
| Deep Black | `#050505` |
| White Soft | `#FAFAFA` |
| Text Dark | `#111111` |
| Text Grey | `#666666` |
| Gradient | `linear-gradient(135deg, #36FF9D, #01F17C)` |
