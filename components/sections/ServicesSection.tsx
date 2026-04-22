"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    icon: "✦",
    title: "VFX & CGI",
    description:
      "Hyper-real campaigns that stop people mid-scroll. From cinematic product shots to full VFX sequences.",
    tags: ["Visual Effects", "CGI", "Motion Graphics"],
    slug: "vfx",
  },
  {
    icon: "◈",
    title: "Social Media",
    description:
      "Strategy, content, and management that drives real growth. We turn followers into loyal customers.",
    tags: ["Strategy", "Content", "Management"],
    slug: "social",
  },
  {
    icon: "◉",
    title: "Branding",
    description:
      "Identity systems that make you impossible to forget. From logo to full brand guidelines.",
    tags: ["Identity", "Brand Guidelines", "Design"],
    slug: "branding",
  },
  {
    icon: "⬡",
    title: "3D Animation",
    description:
      "Motion that makes your product the hero. Stunning 3D renders and animation for any platform.",
    tags: ["3D Renders", "Product Animation", "Architecture"],
    slug: "animation",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 lg:py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-700 uppercase tracking-[0.25em] text-[#01F17C]">
            What We Do
          </span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-800 text-[#111111] tracking-tight">
            Services
          </h2>
          <p className="mt-4 text-[#666666] max-w-md mx-auto text-base">
            End-to-end creative production for brands that refuse to be
            ordinary.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/services#${service.slug}`} className="block h-full">
                <div className="group relative bg-white rounded-2xl p-7 border border-[#f0f0f0] hover:border-[#01F17C]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#01F17C]/5 cursor-pointer h-full hover:scale-[1.02]">
                  {/* Green top accent */}
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#36FF9D] to-[#01F17C] rounded-full" />

                  <div className="mt-4">
                    <span className="text-2xl text-[#01F17C]">{service.icon}</span>
                    <h3 className="mt-4 text-lg font-800 text-[#111111]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#666666] leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-500 px-2.5 py-1 bg-[#f5f5f5] text-[#666666] rounded-full"
                        >
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
