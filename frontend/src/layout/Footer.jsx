import { Link } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Mail,
  FileText,
  BarChart3,
  Globe,
  HeartHandshake,
} from "lucide-react";

function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-primary text-white">
      <div className="h-1 w-full bg-accent" />

      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <ShieldCheck size={14} />
              Emergency & disaster risk data center
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight">
              CEDRAM
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/80">
              The Center for Emergency & Disaster Risk Data Analytics, Research,
              and Information Management supports disaster preparedness,
              resilience, and evidence-based decision-making through data,
              research, analysis, and stakeholder collaboration across Nigeria.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/85">
                Data Analytics
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/85">
                Research
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/85">
                Information Management
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-accent">
              Platform
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/about">
                  About CEDRAM
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/research">
                  Research & Publications
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/disaster-map">
                  Disaster Map
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/insights">
                  Insights & Analytics
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/submit-report">
                  Submit Field Report
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/support">
                  Support CEDRAM
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-accent">
              Governance
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/data-policy">
                  Data Policy
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/terms">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link className="text-white/80 transition hover:text-white" to="/disclaimer">
                  Disclaimer
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              Field reports and submitted information are reviewed through
              validation and verification processes before publication or use in
              official datasets and analysis.
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-accent">
              Contact
            </h4>

            <div className="mt-5 space-y-4 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-accent" />
                <span>info@cedram.org.ng</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-accent" />
                <span>No. 3 Relief Crescent, Ikeja GRA, Ikeja, Lagos, Nigeria</span>
              </div>

              <div className="flex items-start gap-3">
                <Globe size={16} className="mt-0.5 text-accent" />
                <span>National center for disaster risk data, research, and information management</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/submit-report"
                className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accenttext transition hover:opacity-90"
              >
                Submit Field Report
              </Link>

              <Link
                to="/support"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <HeartHandshake size={16} />
                Support CEDRAM
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <FileText size={18} className="mt-0.5 text-accent" />
            <div>
              <div className="text-sm font-semibold">Structured reporting</div>
              <div className="mt-1 text-xs text-white/70">
                Disaster and emergency information is documented in structured formats to support validation, analysis, and informed response planning.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BarChart3 size={18} className="mt-0.5 text-accent" />
            <div>
              <div className="text-sm font-semibold">Research and analytics</div>
              <div className="mt-1 text-xs text-white/70">
                Data is transformed into insights, reports, and evidence that support policy development, preparedness, and resilience building.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-accent" />
            <div>
              <div className="text-sm font-semibold">Trusted information management</div>
              <div className="mt-1 text-xs text-white/70">
                Governed workflows, responsible data handling, and verification processes help maintain quality, accountability, and institutional confidence.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CEDRAM. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link to="/data-policy" className="transition hover:text-white">
              Data Policy
            </Link>
            <Link to="/support" className="transition hover:text-white">
              Support CEDRAM
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;