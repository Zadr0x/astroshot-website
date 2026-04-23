import HeroSection from "@/components/sections/HeroSection";
import Marquee from "@/components/Marquee";
import FeaturedVideos from "@/components/sections/FeaturedVideos";
import ServicesSection from "@/components/sections/ServicesSection";
import PortfolioPreview from "@/components/sections/PortfolioPreview";
import StatsSection from "@/components/sections/StatsSection";
import AboutTeaser from "@/components/sections/AboutTeaser";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTABanner from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <FeaturedVideos />
      <ServicesSection />
      <PortfolioPreview />
      <StatsSection />
      <AboutTeaser />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
