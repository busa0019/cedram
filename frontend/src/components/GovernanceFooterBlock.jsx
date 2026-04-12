import { Link } from "react-router-dom";
import { HOME_COPY } from "../content/homeCopy";

export default function GovernanceFooterBlock() {
  const g = HOME_COPY.governance;

  return (
    <section className="border-t border-border bg-muted py-16">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="relative">
          <div className="absolute left-0 top-0 h-14 w-1.5 rounded-full bg-accent" />

          <div className="pl-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              {g.badge}
            </div>

            <h3 className="mt-5 text-2xl md:text-3xl font-semibold text-primary">
              {g.title}
            </h3>

            <p className="mt-4 max-w-2xl leading-relaxed text-textmuted">
              {g.body}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-textmuted">
              {g.emergencyNote}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/disclaimer"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-secondary"
              >
                Read governance & policies
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-2.5 font-semibold text-textmain transition hover:bg-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-surface p-7 shadow-sm">
          <h4 className="font-semibold text-textmain">{g.safeguardsTitle}</h4>

          <ul className="mt-4 space-y-3 text-sm text-textmuted">
            {g.safeguards.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 text-xs leading-relaxed text-textmuted">
            {g.acceptance}
          </div>
        </div>
      </div>
    </section>
  );
}