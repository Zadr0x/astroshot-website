import HeroSection from "@/components/sections/HeroSection";
import Marquee from "@/components/Marquee";
import ServicesSection from "@/components/sections/ServicesSection";
import PortfolioPreview from "@/components/sections/PortfolioPreview";
import StatsSection from "@/components/sections/StatsSection";
import AboutTeaser from "@/components/sections/AboutTeaser";
import CTABanner from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <ServicesSection />
      <PortfolioPreview />
      <StatsSection />
      <AboutTeaser />
      <CTABanner />
    </>
  );
}
