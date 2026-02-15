export const metadata = {
  title: "Home - islaAPP",
  description: "Build your app in 3 clicks with islaAPP.",
};

import PageIllustration from "@/components/page-illustration";
import Hero from "@/components/hero-home";
import Workflows from "@/components/workflows";
import Features from "@/components/features";
import Pricing from "@/components/pricing-home";
import SplitCarousel from "@/components/split-carousel";
import Cta from "@/components/cta";

export default function Home() {
  return (
    <>
      <PageIllustration />
      <Hero />
      <Workflows />
      <Features />
      <SplitCarousel />
      <Pricing />
      <Cta />
    </>
  );
}
