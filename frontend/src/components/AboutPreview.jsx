import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AboutPreview() {
  return (
    <section className="bg-surface py-28">
      <div className="max-w-7xl mx-auto px-6 grid gap-16 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            About CEDRAM
          </div>

          <h2 className="mt-5 text-4xl font-semibold leading-tight text-primary">
            Strengthening Disaster Resilience Through Data, Research, and Collaboration
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-textmuted">
            CEDRAM serves as a center for emergency and disaster risk data analytics,
            research, and information management, supporting preparedness, response,
            policy development, and resilience building across Nigeria.
          </p>

          <Link
            to="/about"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-secondary"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-muted p-10 md:p-12 shadow-sm"
        >
          <div className="space-y-8">
            {[
              {
                title: "Data-Driven Decision Support",
                desc: "Providing structured disaster risk information and analysis to support planning, preparedness, and response.",
              },
              {
                title: "Research and Knowledge Generation",
                desc: "Producing evidence-based insights, publications, and studies that improve disaster risk reduction and management.",
              },
              {
                title: "Stakeholder Collaboration",
                desc: "Working with government, academia, NGOs, communities, and partners to strengthen resilience and coordinated action.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="h-1.5 w-10 rounded-full bg-accent" />
                <h4 className="mt-4 text-lg font-semibold text-primary">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-textmuted">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutPreview;