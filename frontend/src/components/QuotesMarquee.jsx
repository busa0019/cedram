import { motion } from "framer-motion";
import { HOME_COPY } from "../content/homeCopy";

const DEFAULT_QUOTES = [
  {
    quote:
      "Timely and credible disaster data is essential for improving preparedness, coordination, and risk-informed decision-making.",
    name: "Disaster Risk Management Perspective",
    org: "Institutional Stakeholder",
  },
  {
    quote:
      "Data validation and responsible information sharing strengthen trust and improve the quality of emergency response planning.",
    name: "Emergency Coordination Perspective",
    org: "Response and Humanitarian Community",
  },
  {
    quote:
      "Research and analytics help transform disaster records into practical knowledge for resilience building and policy development.",
    name: "Research Perspective",
    org: "Academic and Policy Community",
  },
  {
    quote:
      "Collaboration across agencies, institutions, and communities is critical to building a stronger disaster risk management ecosystem.",
    name: "Stakeholder Engagement Perspective",
    org: "Multi-Stakeholder Network",
  },
];

function QuoteCard({ item }) {
  return (
    <div className="flex-none w-[320px] sm:w-[380px] lg:w-[430px] px-3">
      <div className="h-full rounded-[28px] border border-border bg-surface p-7 md:p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <p className="text-lg md:text-xl font-semibold leading-relaxed text-textmain">
          “{item.quote}”
        </p>

        <div className="mt-7">
          <div className="font-semibold text-primary">{item.name}</div>
          <div className="text-sm italic text-textmuted">{item.org}</div>
        </div>
      </div>
    </div>
  );
}

export default function QuotesMarquee({
  items = DEFAULT_QUOTES,
  speedSeconds = 55,
}) {
  const q = HOME_COPY.quotes;
  const doubled = [...items, ...items];

  return (
    <section className="bg-accent/10 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            {q.badge}
          </div>

          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
            {q.title}
          </h2>

          <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
            {q.subtitle}
          </p>
        </motion.div>
      </div>

      <div className="relative marquee">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-[rgba(238,212,79,0.10)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[rgba(238,212,79,0.10)] to-transparent" />

        <div
          className="marquee-track flex w-max motion-reduce:animate-none"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          {doubled.map((item, i) => (
            <QuoteCard key={i} item={item} />
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-textmuted">
        {q.footnote}
      </p>
    </section>
  );
}