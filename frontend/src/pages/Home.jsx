import { Suspense, lazy } from "react";
import usePageMeta from "../hooks/usePageMeta";

import Hero from "../components/Hero";
import PartnersStrip from "../components/PartnersStrip";
import Stats from "../components/Stats";
import LatestIncidentsPreview from "../components/LatestIncidentsPreview";
import FeaturedPublicationsPreview from "../components/FeaturedPublicationsPreview";
import LatestNewsPreview from "../components/LatestNewsPreview";
import MethodologyPreview from "../components/MethodologyPreview";
import StandardsAlignment from "../components/StandardsAlignment";
import GovernanceFooterBlock from "../components/GovernanceFooterBlock";
import QuotesMarquee from "../components/QuotesMarquee";
import InstitutionalPreview from "../components/InstitutionalPreview";
import SupportCedramSection from "../components/SupportCedramSection";

const MapPreview = lazy(() => import("../components/MapPreview"));

function Home() {
  usePageMeta({
    title: "CEDRAM — Emergency & Disaster Risk Data Analytics, Research and Information Management",
    description:
      "CEDRAM supports disaster preparedness, resilience, research, and evidence-based decision-making through emergency and disaster risk data analytics, information management, and stakeholder collaboration across Nigeria.",
  });

  return (
    <>
      <Hero />

      <PartnersStrip />

      <Stats />

      <LatestIncidentsPreview limit={3} />

      <Suspense
        fallback={
          <section className="bg-primary text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Interactive mapping
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold">
                Interactive Disaster Map
              </h2>
              <p className="mt-4 max-w-2xl text-white/80">
                Loading map preview…
              </p>
              <div className="mt-10 h-80 rounded-3xl border border-white/10 bg-white/10" />
            </div>
          </section>
        }
      >
        <MapPreview />
      </Suspense>

      <FeaturedPublicationsPreview
        category="publication"
        limit={3}
        intervalMs={6000}
      />

      <LatestNewsPreview
        category="news"
        limit={3}
        intervalMs={4500}
      />

      <MethodologyPreview />

      <StandardsAlignment />

      <InstitutionalPreview />

      <SupportCedramSection />

      <GovernanceFooterBlock />

      <QuotesMarquee />
    </>
  );
}

export default Home;