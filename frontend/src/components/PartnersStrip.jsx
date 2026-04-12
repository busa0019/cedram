import { motion } from "framer-motion";
import { HOME_COPY } from "../content/homeCopy";

export default function PartnersStrip({
  title = HOME_COPY.partners.title,
  subtitle = HOME_COPY.partners.subtitle,
  partners = HOME_COPY.partners.partners,
}) {
  return (
    <section className="bg-accent/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            {HOME_COPY.partners.badge}
          </div>

          <h2 className="mt-5 text-2xl md:text-3xl font-semibold text-primary">
            {title}
          </h2>

          <p className="mt-3 max-w-3xl mx-auto leading-relaxed text-textmuted">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {partners.map((p) => (
            <div
              key={p}
              className="rounded-2xl border border-border bg-white px-5 py-4 text-sm text-textmain shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {p}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}