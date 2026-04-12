import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const steps = [
  {
    n: "1",
    title: "Data collection",
    desc: "Structured intake of field reports, institutional records, and related disaster information for consistent documentation and analysis.",
  },
  {
    n: "2",
    title: "Validation and review",
    desc: "Information is checked against quality standards, source references, and internal review processes to improve accuracy and reliability.",
  },
  {
    n: "3",
    title: "Analysis and publication",
    desc: "Reviewed data is transformed into usable outputs, including incident records, research insights, reports, and public information products.",
  },
  {
    n: "4",
    title: "Governance and accountability",
    desc: "Controlled workflows, documentation, and oversight processes support transparency, auditability, and responsible information management.",
  },
];

function MiniBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
      <span className="h-2 w-2 rounded-full bg-primary" />
      {children}
    </span>
  );
}

export default function MethodologyPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-start">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, x: -24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.7 }}
          viewport={{ once: true }}
        >
          <MiniBadge>Our methodology</MiniBadge>

          <h2 className="mt-5 text-3xl md:text-4xl font-semibold leading-tight text-primary">
            How CEDRAM manages disaster data and information
          </h2>

          <div className="mt-5 h-1 w-20 rounded-full bg-primary" />

          <p className="mt-6 text-lg leading-relaxed text-textmuted">
            CEDRAM applies a structured approach to collecting, reviewing, analyzing,
            and sharing emergency and disaster-related information. This supports
            credibility, responsible communication, and evidence-based decision-making.
          </p>

          <div className="mt-8 space-y-3 text-textmuted">
            <div className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="leading-relaxed">
                Standardized approaches to data collection and documentation
              </p>
            </div>
            <div className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="leading-relaxed">
                Validation and review processes to improve quality and trust
              </p>
            </div>
            <div className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <p className="leading-relaxed">
                Responsible dissemination of data, research outputs, and public information
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/about"
              className="rounded-xl bg-primary px-7 py-3 font-semibold text-white transition hover:bg-secondary"
            >
              Learn more
            </Link>
            <Link
              to="/disclaimer"
              className="rounded-xl border border-border bg-surface px-7 py-3 font-semibold text-textmain transition hover:bg-muted"
            >
              Disclaimer
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.7 }}
          viewport={{ once: true }}
          className="rounded-[32px] border border-border bg-muted p-8 md:p-10 shadow-sm"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-primary">
                Information workflow
              </h3>
              <p className="mt-2 text-textmuted">
                A structured process for collecting, validating, analyzing, and managing disaster-related information.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-textmuted">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Structured
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {steps.map((s, idx) => (
              <div key={s.n} className="flex gap-4">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-semibold text-white shadow-sm">
                    {s.n}
                  </div>
                  {idx !== steps.length - 1 && (
                    <div className="absolute left-1/2 top-11 h-6 w-px -translate-x-1/2 bg-border" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-textmain">{s.title}</p>
                  <p className="mt-1 leading-relaxed text-textmuted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-textmuted">
            Published information may be limited by reporting availability, verification status,
            geographic coverage, and applicable governance requirements.
          </p>
        </motion.div>
      </div>
    </section>
  );
}