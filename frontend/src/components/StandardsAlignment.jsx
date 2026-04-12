import { motion } from "framer-motion";
import { HOME_COPY } from "../content/homeCopy";

export default function StandardsAlignment() {
  const s = HOME_COPY.standards;

  return (
    <section className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            {s.badge}
          </div>

          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
            {s.title}
          </h2>

          <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
            {s.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {s.cards.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="rounded-[28px] border border-border bg-surface p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="h-1.5 w-12 rounded-full bg-accent" />
              <h3 className="mt-5 text-xl font-semibold text-textmain">
                {item.title}
              </h3>
              <p className="mt-4 leading-relaxed text-textmuted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}