"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const services = [
  {
    icon: "◈",
    title: "Mixed Reality",
    description:
      "Mixed Reality videos that combine real footage with VFX to create viral, attention-grabbing content for brands, products, and campaigns. Astroshot produces mixed reality ads and VFX videos in Kuwait and across the GCC.",
    tags: ["VFX", "Mixed Reality", "Viral Content"],
    slug: "mixed-reality",
  },
  {
    icon: "⬡",
    title: "Full CGI",
    description:
      "Full CGI videos with cinematic quality and realistic 3D visuals for products, campaigns, and branded storytelling. Astroshot delivers CGI advertising and product visualization for brands in Kuwait, Saudi Arabia, Dubai, and the GCC.",
    tags: ["CGI", "3D Visuals", "Product Visualization"],
    slug: "full-cgi",
  },
  {
    icon: "✦",
    title: "Cinematic AI Content",
    description:
      "Cinematic AI content that uses AI filmmaking to create realistic, story-driven ads with cinematic scenes, dialogue, and visual storytelling. Astroshot creates AI-powered commercial content for brands that want modern, high-impact campaigns.",
    tags: ["AI Filmmaking", "Commercial Content", "Storytelling"],
    slug: "cinematic-ai-content",
  },
  {
    icon: "◉",
    title: "Social Media Content",
    description:
      "Social media content creation for Instagram and TikTok, including reels, photography, videography, creative direction, and monthly content planning. Astroshot helps brands grow with engaging social media content built for reach and brand awareness.",
    tags: ["Instagram", "TikTok", "Reels", "Content Planning"],
    slug: "social",
  },
  {
    icon: "▣",
    title: "Motion Graphics",
    description:
      "Motion graphics and animation videos that explain products, services, offers, and digital experiences in a clear and engaging way. Astroshot creates 2D motion graphics, 3D animation, and explainer videos for banks, fintech, telecom, and service brands.",
    tags: ["Motion Graphics", "2D/3D Animation", "Explainer Videos"],
    slug: "motion-graphics",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            What We Do
          </span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Services
          </h2>
          <p className="mt-4 text-white/60 max-w-3xl mx-auto text-base leading-relaxed">
            From cinematic VFX and CGI production to social media, branding, and content strategy, Astroshot helps brands create campaigns that capture attention, drive engagement, and stay memorable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/services#${service.slug}`} className="block h-full">
                <div className="group relative bg-[#0d0d0d] rounded-2xl p-7 border border-white/10 hover:border-[#01F17C]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#01F17C]/10 cursor-pointer h-full hover:-translate-y-1">
                  {/* Green top accent */}
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#36FF9D] to-[#01F17C] rounded-full" />
                  <div className="mt-4">
                    <span className="text-2xl text-[#01F17C]">{service.icon}</span>
                    <h3 className="mt-4 text-lg font-extrabold text-white">{service.title}</h3>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed">{service.description}</p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-white/5 text-white/70 rounded-full border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
