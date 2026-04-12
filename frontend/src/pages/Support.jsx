import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  HeartHandshake,
  Landmark,
  ShieldCheck,
  FileBarChart,
  GraduationCap,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=2200&q=80",
    alt: "Disaster data monitoring and analysis",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=80",
    alt: "Research, funding, and institutional support collaboration",
  },
  {
    src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
    alt: "Strategic partnership and governance planning",
  },
];

const supportAreas = [
  {
    icon: FileBarChart,
    title: "Research and publications",
    desc: "Support evidence-based studies, reports, analytics outputs, and publications that improve disaster risk understanding and policy development.",
  },
  {
    icon: ShieldCheck,
    title: "Data systems and information management",
    desc: "Help strengthen data collection workflows, validation systems, geographic intelligence tools, and trusted information management infrastructure.",
  },
  {
    icon: GraduationCap,
    title: "Training and capacity building",
    desc: "Fund workshops, stakeholder learning sessions, and knowledge-sharing programs that improve preparedness and resilience across sectors.",
  },
];

const supportModels = [
  {
    icon: BadgeDollarSign,
    title: "Make a donation",
    desc: "Provide financial support to help sustain priority activities, research outputs, and operational improvements across the platform.",
  },
  {
    icon: Landmark,
    title: "Fund a program",
    desc: "Support a specific initiative such as training, public education, field data systems, resilience research, or community engagement activities.",
  },
  {
    icon: HeartHandshake,
    title: "Become a partner",
    desc: "Collaborate with CEDRAM as a development partner, institutional sponsor, technical contributor, or strategic supporter.",
  },
];

function DetailRow({ label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="text-sm font-semibold text-textmuted">{label}</div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-lg font-semibold text-textmain break-all">
          {value}
        </div>

        {copyable && (
          <button
            onClick={handleCopy}
            className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border px-3 transition ${
              copied
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-border text-textmain hover:bg-muted"
            }`}
            aria-label={`Copy ${label}`}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline text-xs font-semibold">
                {copied ? "Copied" : "Copy"}
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Support() {
  usePageMeta({
    title: "Support CEDRAM — Donations, Partnerships, and Program Funding",
    description:
      "Support CEDRAM through donations, partnerships, and program funding to strengthen disaster risk research, data systems, training, and resilience-building initiatives.",
  });

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

  return (
    <main className="bg-background text-textmain">
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
            Support CEDRAM
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            Support disaster risk research, data systems, and resilience-building
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-white/85"
          >
            Your support helps CEDRAM strengthen disaster research, trusted
            information systems, stakeholder training, publications, and
            evidence-based preparedness across Nigeria.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="#support-options"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
            >
              View support options
            </a>

            <a
              href="#bank-support"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Bank transfer details
            </a>
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all",
                  i === index
                    ? "w-10 bg-accent"
                    : "w-2.5 bg-white/35 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-primary">
              Why support matters
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Your support helps strengthen practical disaster risk intelligence
            </h2>

            <p className="mt-4 leading-relaxed text-textmuted">
              Contributions to CEDRAM can help improve the systems, research,
              training, and collaboration needed for better preparedness,
              stronger resilience, and more informed decision-making.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {supportAreas.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-border bg-white p-7 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accenttext">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-textmain">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-textmuted">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="support-options"
        className="relative overflow-hidden border-t border-border bg-muted py-20"
      >
        <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Support options
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Ways to support CEDRAM
            </h2>

            <p className="mt-4 leading-relaxed text-textmuted">
              Support can take different forms depending on your goals,
              organization type, or level of involvement.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {supportModels.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-border bg-surface p-7 shadow-sm"
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
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[28px] border border-border bg-white p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-primary">
              Funding transparency and responsible use
            </h3>

            <p className="mt-4 leading-relaxed text-textmuted">
              Support provided to CEDRAM should align with its mission of
              strengthening disaster preparedness, research, information
              management, and resilience-building. Funding can be directed toward
              approved programs, research, system improvements, training, and
              public knowledge initiatives, subject to institutional governance
              and accountability processes.
            </p>

            <p className="mt-4 leading-relaxed text-textmuted">
              For institutional funding, sponsorship, or designated support,
              contributors are encouraged to contact CEDRAM in advance so
              contributions can be aligned with approved priorities and reporting
              processes.
            </p>
          </div>
        </div>
      </section>

      <section id="bank-support" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-primary">
              <Building2 size={14} />
              Direct bank support
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              Support CEDRAM via bank transfer
            </h2>

            <p className="mt-4 leading-relaxed text-textmuted">
              Individuals and institutions may support CEDRAM through direct bank
              transfer. Please ensure all payment details published here are the
              center’s verified and approved remittance details before making any
              transfer.
            </p>
          </div>

          <div className="mt-10 rounded-[32px] border border-border bg-muted/50 p-8 shadow-sm md:p-10">
            <div className="grid gap-5 md:grid-cols-2">
              <DetailRow label="Account Name" value="CEDRAM" copyable />
              <DetailRow label="Bank Name" value="Your Bank Name" copyable />
              <DetailRow label="Account Number" value="0123456789" copyable />
              <DetailRow
                label="Support Contact"
                value="info@cedram.org.ng"
                copyable
              />
            </div>

            <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-5">
              <p className="text-sm leading-relaxed text-textmain">
                <span className="font-semibold text-primary">Important:</span>{" "}
                For institutional funding, sponsorship, designated program
                support, or large contributions, please contact CEDRAM before
                remittance so the support can be properly documented and aligned
                with approved programs, reporting expectations, and governance
                procedures.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Contact CEDRAM
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-textmain transition hover:bg-muted"
              >
                Learn more about the center
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-primary" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 px-8 py-10 text-white backdrop-blur-sm md:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Ready to support CEDRAM?
                </h2>

                <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
                  Contact the center to discuss donations, sponsorships,
                  institutional collaboration, or program-focused support.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 lg:justify-end">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accenttext transition hover:brightness-95"
                >
                  Contact for support
                </Link>

                <Link
                  to="/research"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Explore research
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Support;