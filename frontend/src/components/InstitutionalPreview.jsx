import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Data management",
    desc: "Structured collection, validation, storage, and dissemination of disaster and emergency information.",
  },
  {
    title: "Research and analysis",
    desc: "Evidence-based studies, trend analysis, and policy-oriented outputs that support planning, preparedness, and learning.",
  },
  {
    title: "Stakeholder coordination",
    desc: "Improving access to credible information for agencies, institutions, responders, researchers, and communities.",
  },
];

export default function InstitutionalPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="pointer-events-none absolute -top-20 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Center mandate
            </div>

            <h2 className="mt-5 text-3xl md:text-5xl font-semibold leading-tight text-primary">
              Emergency and disaster risk data, research, and information for informed action
            </h2>

            <div className="mt-5 h-1 w-24 rounded-full bg-primary" />

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-textmuted">
              CEDRAM supports the collection, analysis, and dissemination of emergency
              and disaster information to strengthen preparedness, coordination,
              research, and evidence-based decision-making across Nigeria.
            </p>

            <p className="mt-5 max-w-2xl leading-relaxed text-textmuted">
              By combining incident records, geographic intelligence, research outputs,
              and stakeholder engagement, the platform is designed to support
              resilience-building, policy development, and responsible public communication.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                About CEDRAM
              </Link>

              <Link
                to="/contact"
                className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-textmain transition hover:bg-muted"
              >
                Contact CEDRAM
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.7, delay: 0.05 }}
            viewport={{ once: true }}
            className="rounded-[32px] border border-border bg-white p-6 md:p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-textmuted">
                  Institutional focus
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-textmain">
                  Core functions of CEDRAM
                </h3>
              </div>

              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accenttext shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2 3 7v6c0 5 3.8 7.7 9 9 5.2-1.3 9-4 9-9V7l-9-5Z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {pillars.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={reduceMotion ? undefined : { opacity: 0, x: 18 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={reduceMotion ? undefined : { duration: 0.5, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border bg-muted/55 px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accenttext">
                      {idx + 1}
                    </div>

                    <div>
                      <h4 className="font-semibold text-textmain">{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-textmuted">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/15 px-5 py-4">
              <p className="text-sm leading-relaxed text-textmain">
                <span className="font-semibold text-primary">Mission:</span>{" "}
                To collect, analyze, and disseminate comprehensive data related to
                emergencies and disasters, fostering informed decision-making and
                research to mitigate risks and improve community safety.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}