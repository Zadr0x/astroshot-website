import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PortfolioPreview from "@/components/sections/PortfolioPreview";
import StatsSection from "@/components/sections/StatsSection";
import AboutTeaser from "@/components/sections/AboutTeaser";
import Marquee from "@/components/Marquee";
import CTABanner from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PortfolioPreview />
      <StatsSection />
      <AboutTeaser />
      <Marquee />
      <CTABanner />
    </>
  );
}
