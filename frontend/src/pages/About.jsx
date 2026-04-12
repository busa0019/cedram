import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=2200&q=80",
    alt: "Satellite and disaster monitoring view",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=80",
    alt: "Emergency coordination and data operations",
  },
  {
    src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
    alt: "Policy planning and institutional governance",
  },
];

function About() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.7, ease: "easeOut" },
    },
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : -28 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: reduceMotion ? 0 : 0.75, ease: "easeOut" },
    },
  };

  const fadeRight = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : 28 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: reduceMotion ? 0 : 0.75, ease: "easeOut" },
    },
  };

  const hoverLift = reduceMotion
    ? {}
    : {
        whileHover: { y: -6 },
        transition: { type: "spring", stiffness: 230, damping: 18 },
      };

  const vmv = [
    {
      title: "Vision",
      text: "A resilient Nigeria with data-informed disaster management.",
      Icon: EyeIcon,
      tone: "primary",
    },
    {
      title: "Mission",
      text: "To drive disaster risk reduction in Nigeria through data analytics, research, and stakeholder collaboration.",
      Icon: TargetIcon,
      tone: "accent",
    },
    {
      title: "Values",
      text: "Data-driven action, collaboration, innovation, resilience, integrity, and excellence guide the Center’s work.",
      Icon: PeopleIcon,
      tone: "secondary",
    },
  ];

  const activities = [
    {
      title: "Data management",
      desc:
        "Developing disaster risk databases, information systems, and analytics tools that support reliable emergency and disaster information.",
    },
    {
      title: "Research and publications",
      desc:
        "Producing research, reports, and analytical outputs that improve understanding of disaster trends, impacts, vulnerabilities, and solutions.",
    },
    {
      title: "Training and capacity building",
      desc:
        "Offering training, workshops, and learning opportunities for professionals, institutions, and communities involved in emergency management.",
    },
    {
      title: "Stakeholder engagement",
      desc:
        "Facilitating collaboration, data sharing, and coordination among agencies, researchers, partners, and other disaster management stakeholders.",
    },
    {
      title: "Awareness and advocacy",
      desc:
        "Promoting disaster risk reduction awareness, public understanding, and stronger evidence-based approaches to resilience and preparedness.",
    },
    {
      title: "Real-time hotspot information",
      desc:
        "Supporting access to timely information on potential disaster hotspots and emerging risks to improve preparedness and situational awareness.",
    },
  ];

  const partners = [
    "National Emergency Management Agency (NEMA)",
    "Nigeria Meteorological Agency (NiMet)",
    "Nigeria Hydrological Services Agency (NIHSA)",
    "National Bureau of Statistics (NBS)",
    "State Emergency Management Agencies (SEMAs)",
    "Academic, humanitarian, policy, and development partners",
  ];

  const governance = [
    {
      title: "Permission-based access",
      desc:
        "Role-based controls help ensure that only authorized users can create, review, publish, or manage sensitive records.",
    },
    {
      title: "Verification workflows",
      desc:
        "Incident reports and submissions move through defined review stages before public dissemination or integration.",
    },
    {
      title: "Auditability and traceability",
      desc:
        "Critical actions are logged to support accountability, institutional review, and operational transparency.",
    },
    {
      title: "Activity visibility",
      desc:
        "Operational activity tracking helps leadership and administrators understand usage, changes, and review history.",
    },
    {
      title: "Controlled data lifecycle",
      desc:
        "Incident records move through structured lifecycle stages to support consistency, trust, and governance.",
    },
    {
      title: "Reporting readiness",
      desc:
        "Analytics and export-ready outputs support institutional reporting, planning, research workflows, and evidence-based decision-making.",
    },
  ];

  return (
    <main className="bg-background text-textmain">
      {/* HERO */}
      <section className="relative -mt-20 flex h-[78vh] min-h-[620px] items-center justify-center overflow-hidden pt-20 text-white">
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
                opacity: { duration: 1, ease: "easeOut" },
                scale: { duration: 10, ease: "easeOut" },
              }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(238,212,79,0.10),transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.58)_32%,rgba(2,6,23,0.76)_72%,rgba(2,6,23,0.90)_100%)]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            About CEDRAM
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            A national center for emergency and disaster risk data analytics, research, and information management
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-white/85"
          >
            The Center for Emergency & Disaster Risk Data Analytics, Research, and Information Management
            (CEDRAM) supports disaster risk reduction in Nigeria through data analytics, research,
            information management, and stakeholder collaboration.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/research"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
            >
              View publications
            </Link>

            <Link
              to="/submit-report"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Submit field report
            </Link>
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-2">
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

      {/* OVERVIEW */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="relative max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.02fr_0.98fr] items-start"
        >
          <motion.div variants={fadeLeft}>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Center overview
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Who we are and what we do
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-primary" />

            <p className="mt-6 text-lg leading-relaxed text-textmuted">
              CEDRAM serves as a platform for the collection, management, analysis,
              and dissemination of emergency and disaster risk information in Nigeria.
              It is designed to strengthen preparedness, research, policy support,
              and evidence-based decision-making.
            </p>

            <p className="mt-5 text-lg leading-relaxed text-textmuted">
              By combining disaster data analytics, research, information management,
              collaboration, and responsible dissemination, the Center supports more
              effective disaster response, mitigation, resilience planning, and public awareness.
            </p>

            <motion.div variants={fadeUp} className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted p-6 shadow-sm">
                <p className="font-semibold text-primary">Who we support</p>
                <p className="mt-2 text-sm leading-relaxed text-textmuted">
                  Government agencies, emergency responders, researchers, institutions,
                  humanitarian actors, communities, and the public.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted p-6 shadow-sm">
                <p className="font-semibold text-primary">What we provide</p>
                <p className="mt-2 text-sm leading-relaxed text-textmuted">
                  Data analytics, research outputs, reports, training, collaboration support,
                  and structured information for disaster preparedness and risk reduction.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeRight}
            className="rounded-[32px] border border-border bg-muted p-8 md:p-10 shadow-sm"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-primary">
                  Core focus areas
                </h3>
                <p className="mt-2 text-textmuted">
                  Priority risk themes and research domains.
                </p>
              </div>

              <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-textmuted">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Nigeria-focused
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {[
                {
                  title: "Flood risk management",
                  desc: "Analyzing flood patterns, impacts, vulnerability, and risk reduction priorities.",
                },
                {
                  title: "Climate change impacts",
                  desc: "Studying climate-related risks and their influence on disaster frequency, severity, and resilience planning.",
                },
                {
                  title: "Urban disaster risks",
                  desc: "Exploring urban-specific emergency and disaster challenges, including exposure, infrastructure, and vulnerability.",
                },
                {
                  title: "Health emergencies and displacement",
                  desc: "Including disease outbreaks, conflict-related risks, and displacement-related emergency concerns.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <h4 className="text-lg font-semibold text-textmain">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-textmuted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/disaster-map"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-secondary"
              >
                Explore the map
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 font-semibold text-textmain transition hover:bg-surface"
              >
                View programs
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* VISION MISSION VALUES */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-muted/60 dark:bg-muted/45 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="relative max-w-7xl mx-auto px-6"
        >
          <div className="grid gap-10 md:grid-cols-3 text-center">
            {vmv.map(({ title, text, Icon, tone }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                {...hoverLift}
                className="px-2"
              >
                <div
                  className={[
                    "mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border shadow-sm",
                    tone === "accent"
                      ? "bg-accent text-accenttext border-black/10"
                      : tone === "secondary"
                      ? "bg-secondary text-white border-white/10"
                      : "bg-primary text-white border-white/10",
                  ].join(" ")}
                >
                  <Icon className={tone === "accent" ? "h-8 w-8 text-accenttext" : "h-8 w-8 text-white"} />
                </div>

                <h3 className="mt-7 text-3xl font-semibold text-textmain">{title}</h3>

                <p className="mt-4 max-w-sm mx-auto leading-relaxed text-textmuted">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ACTIVITIES */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/12 blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeUp} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Core activities
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              What the Center delivers
            </h2>
            <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
              The Center supports disaster risk reduction through data systems, research,
              training, collaboration, advocacy, and timely emergency information.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {activities.map((a) => (
              <motion.div
                key={a.title}
                variants={fadeUp}
                whileHover={reduceMotion ? {} : { y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="rounded-[28px] border border-border bg-muted/55 p-8 shadow-sm transition hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-accent font-semibold text-accenttext">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-textmain">
                      {a.title}
                    </h3>
                    <p className="mt-4 leading-relaxed text-textmuted">{a.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PARTNERS / SOURCES */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-accent/10" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeUp} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Institutional ecosystem
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Data sources and collaboration
            </h2>
            <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
              The Center works with institutions, agencies, and partners that contribute to disaster
              data quality, research, preparedness, and evidence-based national resilience.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <motion.div
                key={p}
                {...hoverLift}
                className="rounded-2xl border border-border bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <div className="font-semibold text-textmain">{p}</div>
                    <div className="mt-2 text-sm leading-relaxed text-textmuted">
                      Collaboration, data sharing, research support, and coordinated evidence use aligned with disaster risk reduction priorities.
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* GOVERNANCE */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-muted/65 dark:bg-muted/45 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.24 }}
          className="relative max-w-7xl mx-auto px-6"
        >
          <motion.div variants={fadeUp} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Governance
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Governance and data responsibility
            </h2>
            <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
              The Center balances timely information use with accountability, traceability,
              responsible publication, and strong institutional oversight.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {governance.map((g) => (
              <motion.div
                key={g.title}
                variants={fadeUp}
                {...hoverLift}
                className="rounded-[28px] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-semibold text-white shadow-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-textmain">{g.title}</h3>
                    <p className="mt-2 leading-relaxed text-textmuted">{g.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-10 md:p-14 text-white shadow-lg"
          >
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Collaborate with CEDRAM
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                  Support the Center through research collaboration, data sharing,
                  stakeholder partnership, training, advocacy, or verified reporting
                  that strengthens disaster resilience in Nigeria.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/submit-report"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
                >
                  Submit a report
                </Link>
                <Link
                  to="/research"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  View publications
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* Inline icons */
function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 18a6 6 0 1 0-6-6 6 6 0 0 0 6 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 14a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function PeopleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2.5 20.5a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 10.5a3.5 3.5 0 1 1 0-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21.5 20.5a6.5 6.5 0 0 0-7-6.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default About;