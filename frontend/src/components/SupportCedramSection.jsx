import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartHandshake, Landmark, BadgeDollarSign } from "lucide-react";

export default function SupportCedramSection() {
  const reduceMotion = useReducedMotion();

  const cards = [
    {
      icon: BadgeDollarSign,
      title: "Make a donation",
      desc: "Support disaster risk research, trusted data systems, publications, and public education through financial contributions.",
    },
    {
      icon: Landmark,
      title: "Fund a program",
      desc: "Help strengthen training workshops, resilience initiatives, data collection, and field-informed risk intelligence programs.",
    },
    {
      icon: HeartHandshake,
      title: "Become a partner",
      desc: "Collaborate with CEDRAM through institutional partnerships, sponsorships, research support, or technical assistance.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-accent/10 py-24">
      <div className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.7 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            Support CEDRAM
          </div>

          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight text-primary">
            Support disaster risk research, data systems, and resilience-building
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-textmuted">
            CEDRAM works to improve preparedness, research, public information,
            and evidence-based decision-making. Your support helps strengthen
            disaster data infrastructure, publications, stakeholder training,
            and programs that improve resilience.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 0.55, delay: idx * 0.08 }
                }
                viewport={{ once: true }}
                className="rounded-[28px] border border-border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-textmain">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-textmuted">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-12 rounded-[32px] border border-white/10 bg-primary px-8 py-10 text-white md:px-12 shadow-lg"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold">
                Support CEDRAM through donations, partnerships, or program funding
              </h3>

              <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
                Whether you are an individual supporter, institution, development
                partner, or corporate sponsor, your contribution can help expand
                research outputs, strengthen disaster data systems, support
                capacity building, and improve the availability of trusted risk
                information.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link
                to="/support"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accenttext transition hover:brightness-95"
              >
                Support CEDRAM
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Discuss partnership
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}