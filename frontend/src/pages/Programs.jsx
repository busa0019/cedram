import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Programs() {
  const reduceMotion = useReducedMotion();

  const slides = [
    {
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2200&q=80",
      alt: "Programs and policy planning",
    },
    {
      src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2200&q=80",
      alt: "Training and institutional workshop activity",
    },
    {
      src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2200&q=80",
      alt: "Research and analysis work",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.6, ease: "easeOut" },
    },
  };

  const programs = [
    {
      title: "Data management",
      desc:
        "Develop disaster risk databases, information systems, and analytics tools that support the collection, management, and use of emergency and disaster information.",
      bullets: [
        "Disaster risk databases and repositories",
        "Data collection, structuring, and quality management",
        "Information systems for disaster records",
        "Analytics-ready tools and structured outputs",
      ],
      Icon: DatabaseIcon,
    },
    {
      title: "Research and publications",
      desc:
        "Study disaster impacts, trends, vulnerabilities, and solutions, and translate findings into research outputs, publications, and actionable reports.",
      bullets: [
        "Research studies and thematic analysis",
        "Disaster impact and vulnerability assessment",
        "Publications, reports, and policy-oriented outputs",
        "Evidence-based recommendations for risk reduction",
      ],
      Icon: SearchIcon,
    },
    {
      title: "Training and capacity building",
      desc:
        "Build professional, institutional, and community capacity for data-driven emergency management and disaster risk reduction practice.",
      bullets: [
        "Training workshops and seminars",
        "Technical learning sessions",
        "Professional and community capacity development",
        "Capacity-building resources and materials",
      ],
      Icon: CapIcon,
    },
    {
      title: "Stakeholder engagement",
      desc:
        "Facilitate collaboration, data sharing, and coordinated learning among institutions, practitioners, researchers, communities, and disaster management stakeholders.",
      bullets: [
        "Stakeholder dialogue and consultation",
        "Institutional collaboration and partnerships",
        "Knowledge exchange initiatives",
        "Data-sharing and coordination support",
      ],
      Icon: CommunityIcon,
    },
    {
      title: "Awareness and advocacy",
      desc:
        "Promote public awareness, risk communication, and disaster risk reduction advocacy that supports preparedness, resilience, and informed public engagement.",
      bullets: [
        "Public awareness campaigns",
        "Risk communication activities",
        "Advocacy for disaster risk reduction",
        "Community sensitization and resilience awareness",
      ],
      Icon: ShieldIcon,
    },
    {
      title: "Real-time hotspot information",
      desc:
        "Support access to timely information on potential disaster hotspots and emerging risks to improve awareness, preparedness, and planning.",
      bullets: [
        "Potential disaster hotspot information",
        "Situational awareness support",
        "Early risk signals and emerging trend visibility",
        "Information dissemination pathways",
      ],
      Icon: GlobeIcon,
    },
  ];

  const focusAreas = [
    "Flood risk management",
    "Climate change impacts",
    "Urban disaster risks",
    "Health emergencies",
    "Conflict and displacement",
  ];

  return (
    <main className="bg-background text-textmain">
      {/* HERO */}
      <section className="relative -mt-20 flex h-[66vh] min-h-[560px] items-center justify-center overflow-hidden pt-20 text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={slides[index].src}
              src={slides[index].src}
              alt={slides[index].alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.0, ease: "easeOut" },
                scale: { duration: 10, ease: "easeOut" },
              }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(238,212,79,0.10),transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.68)_32%,rgba(2,6,23,0.82)_72%,rgba(2,6,23,0.92)_100%)]" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            Programs and activities
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
            CEDRAM programs and activities
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">
            The Center’s programs advance disaster data management, research, training,
            stakeholder collaboration, advocacy, and timely information use to support
            disaster risk reduction and resilience in Nigeria.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/research"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
            >
              View publications
            </Link>

            <Link
              to="/submit-report"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Submit field report
            </Link>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-10 bg-accent" : "w-2.5 bg-white/35 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* INTRO */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
                Program structure
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
                Programs that translate data into action
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-textmuted">
                CEDRAM’s programs are designed to strengthen preparedness, improve evidence use,
                build institutional capacity, and support collaboration for disaster risk reduction
                and resilience across Nigeria.
              </p>
            </div>

            <Link to="/about" className="font-semibold text-secondary hover:underline">
              Learn more about CEDRAM →
            </Link>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {programs.map((p, idx) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.55,
                  ease: "easeOut",
                  delay: idx * 0.03,
                }}
                className="rounded-[28px] border border-border bg-muted/55 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-primary text-white">
                    <p.Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-textmain">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-textmuted">{p.desc}</p>

                    <div className="mt-5">
                      <div className="text-sm font-semibold text-primary">Key activities</div>
                      <ul className="mt-2 space-y-1 pl-5 text-sm text-textmuted list-disc">
                        {p.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-accent/10" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Focus areas
            </div>

            <h2 className="mt-5 text-2xl md:text-4xl font-semibold text-primary">
              Priority thematic areas
            </h2>
            <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
              The Center’s programs align with critical thematic areas that shape disaster risk,
              vulnerability, preparedness, response planning, and resilience in Nigeria.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {focusAreas.map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-border bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                  ✓
                </div>
                <div className="mt-4 text-base font-semibold text-textmain">{item}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/insights"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary"
            >
              Explore insights
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 font-semibold text-textmain transition hover:bg-white"
            >
              View publications
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Inline icons */
function DatabaseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7c0-2 4-3 8-3s8 1 8 3-4 3-8 3-8-1-8-3Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 7v10c0 2 4 3 8 3s8-1 8-3V7" stroke="currentColor" strokeWidth="2" />
      <path d="M4 12c0 2 4 3 8 3s8-1 8-3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 10.5V16c0 2.5 3 4.5 7 4.5s7-2 7-4.5v-5.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function CommunityIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 20.5a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 10.5a3.5 3.5 0 1 1 0-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 20.5a6.5 6.5 0 0 0-7-6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 20 6v7c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-4Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function GlobeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2c3 2.8 5 6.4 5 10s-2 7.2-5 10c-3-2.8-5-6.4-5-10s2-7.2 5-10Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}