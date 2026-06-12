import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { Results } from "@/components/sections/results";
import { Surfaces } from "@/components/sections/surfaces";
import { Process } from "@/components/sections/process";
import { WidgetShowcase } from "@/components/sections/widget-showcase";
import { CTABox } from "@/components/sections/cta-box";
import { TrustedBy } from "@/components/sections/trusted-by";
import { PricingMini } from "@/components/sections/pricing-mini";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center pb-24 min-h-screen">
      <Nav />
      <Hero />
      <FeaturesGrid />
      <Surfaces />
      <Process />
      <WidgetShowcase />
      <Results />
      <PricingMini />
      <CTABox />
      <TrustedBy />
      <Footer />
    </div>
  );
}
