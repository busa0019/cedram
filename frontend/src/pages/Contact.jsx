import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Contact() {
  const reduceMotion = useReducedMotion();

  const office = {
    name: "Center for Emergency & Disaster Risk Data Analytics, Research, and Information Management (CEDRAM)",
    addressShort: "No. 3 Relief Crescent, Ikeja GRA, Ikeja, Lagos, Nigeria",
    addressMapQuery: "No. 3 Relief Crescent, Ikeja GRA, Ikeja, Lagos, Nigeria",
    emails: [
      { label: "General inquiries", value: "info@cedram.org.ng" },
      { label: "Partnerships", value: "partnerships@cedram.org.ng" },
      { label: "Research & data requests", value: "research@cedram.org.ng" },
    ],
    phones: [
      { label: "Office line", value: "+234 801 234 5678" },
      { label: "Support desk", value: "+234 809 876 5432" },
    ],
    hours: [
      { day: "Monday", time: "9:00 AM – 5:00 PM" },
      { day: "Tuesday", time: "9:00 AM – 5:00 PM" },
      { day: "Wednesday", time: "9:00 AM – 5:00 PM" },
      { day: "Thursday", time: "9:00 AM – 5:00 PM" },
      { day: "Friday", time: "9:00 AM – 5:00 PM" },
      { day: "Saturday", time: "Closed" },
      { day: "Sunday", time: "Closed" },
    ],
  };

  const faqItems = [
    {
      q: "Is this an emergency response hotline?",
      a: "No. CEDRAM is a data, research, and information management center focused on disaster risk reduction, analysis, and stakeholder support. For urgent emergencies, please contact the appropriate emergency response agency.",
    },
    {
      q: "What can I contact CEDRAM about?",
      a: "You can reach us for research inquiries, institutional partnerships, disaster data requests, training and capacity-building opportunities, policy support, publications, and verified disaster-related information.",
    },
    {
      q: "Can I request data for research or planning?",
      a: "Yes. We welcome requests from researchers, institutions, government agencies, NGOs, and development partners. Please include your purpose, location scope, timeframe, and the specific data fields you need.",
    },
    {
      q: "Does CEDRAM collaborate with other organizations?",
      a: "Yes. We actively engage with public institutions, humanitarian actors, academic bodies, private organizations, and communities to strengthen data sharing, preparedness, response, and resilience.",
    },
    {
      q: "How long does it take to receive a response?",
      a: "Most inquiries receive a response within 1–2 business days. Requests requiring verification, technical review, or formal collaboration may take longer.",
    },
    {
      q: "Can I report an error in published information?",
      a: "Yes. If you identify an error, please share the reference, a clear explanation of the issue, and any supporting source or evidence. Our team will review it through the established validation process.",
    },
  ];

  const slides = useMemo(
    () => [
      {
        src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=2200&q=80",
        alt: "Emergency management coordination and institutional support",
      },
      {
        src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
        alt: "Research collaboration and stakeholder engagement",
      },
      {
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=80",
        alt: "Disaster data analytics and information management",
      },
    ],
    []
  );

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reduceMotion, slides.length]);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const container = useMemo(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
    }),
    [reduceMotion]
  );

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 22 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0 : 0.7, ease: "easeOut" },
      },
    }),
    [reduceMotion]
  );

  const fadeLeft = useMemo(
    () => ({
      hidden: { opacity: 0, x: reduceMotion ? 0 : -28 },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: reduceMotion ? 0 : 0.75, ease: "easeOut" },
      },
    }),
    [reduceMotion]
  );

  const fadeRight = useMemo(
    () => ({
      hidden: { opacity: 0, x: reduceMotion ? 0 : 28 },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: reduceMotion ? 0 : 0.75, ease: "easeOut" },
      },
    }),
    [reduceMotion]
  );

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.message.trim()) return "Please enter your message.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    const err = validate();
    if (err) return setStatus({ type: "error", message: err });

    try {
      setStatus({ type: "sending", message: "Sending..." });
      await axios.post(`${API_URL}/api/contact`, form);
      setStatus({ type: "success", message: "Message sent. We’ll get back to you shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e2) {
      console.error(e2);
      setStatus({
        type: "error",
        message: e2?.response?.data?.message || "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <main className="bg-background text-textmain">
      <section className="relative -mt-20 flex h-[62vh] min-h-[520px] items-center justify-center overflow-hidden pt-20 text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={slides[heroIndex].src}
              src={slides[heroIndex].src}
              alt={slides[heroIndex].alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.0, ease: "easeOut" },
                scale: { duration: 10, ease: "easeOut" },
              }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(238,212,79,0.10),transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.68)_32%,rgba(2,6,23,0.82)_72%,rgba(2,6,23,0.92)_100%)]" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl px-6 text-center"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            CEDRAM • Contact • Research • Partnerships
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-semibold leading-tight md:text-6xl"
          >
            Get in Touch
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-lg text-white/90">
            Contact CEDRAM for disaster risk data inquiries, research collaboration, stakeholder
            engagement, publications, and institutional partnerships.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/submit-report"
              className="rounded-xl bg-accent px-7 py-3 font-semibold text-accenttext shadow-sm transition hover:brightness-95"
            >
              Submit Field Report
            </Link>
            <Link
              to="/disaster-map"
              className="rounded-xl border border-white/30 px-7 py-3 font-semibold transition hover:bg-white/10"
            >
              Explore Map
            </Link>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all",
                  i === heroIndex ? "w-10 bg-accent" : "w-2.5 bg-white/35 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-12"
        >
          <motion.aside variants={fadeLeft} className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-border bg-surface/85 p-8 shadow-sm backdrop-blur-[2px]">
              <h2 className="text-2xl font-semibold text-primary md:text-3xl">{office.name}</h2>
              <p className="mt-3 leading-relaxed text-textmuted">
                Reach our office for official correspondence, research engagement, data requests,
                collaboration opportunities, and information support.
              </p>

              <div className="mt-7 space-y-5">
                <InfoRow
                  icon={<PinIcon className="h-5 w-5" />}
                  label="Address"
                  value={office.addressShort}
                />

                <div className="flex items-start gap-3">
                  <IconBox>
                    <MailIcon className="h-5 w-5" />
                  </IconBox>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-textmuted">Email</div>
                    <div className="mt-1 space-y-1 text-sm font-semibold text-textmain">
                      {office.emails.map((e) => (
                        <div key={e.value} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-textmuted">{e.label}:</span>
                          <a className="text-secondary hover:underline" href={`mailto:${e.value}`}>
                            {e.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconBox>
                    <PhoneIcon className="h-5 w-5" />
                  </IconBox>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-textmuted">Phone</div>
                    <div className="mt-1 space-y-1 text-sm font-semibold text-textmain">
                      {office.phones.map((p) => (
                        <div key={p.value} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-textmuted">{p.label}:</span>
                          <a
                            className="text-secondary hover:underline"
                            href={`tel:${p.value.replace(/\s+/g, "")}`}
                          >
                            {p.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              variants={fadeUp}
              className="rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-[1px] shadow-sm"
            >
              <div className="rounded-3xl border border-border bg-surface p-8">
                <h3 className="text-xl font-semibold text-textmain">Before you send</h3>
                <p className="mt-2 text-sm leading-relaxed text-textmuted">
                  To help us respond promptly, please include:
                </p>

                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-textmuted">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    Your full name, organization, and reason for contacting us
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    Any report reference, incident details, or location information if applicable
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    For data requests, include the time period, location, and data fields needed
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-3xl border border-border bg-muted/55 shadow-sm backdrop-blur-[2px]"
            >
              <div className="border-b border-border bg-muted/50 p-5">
                <div className="font-semibold text-textmain">Office location</div>
                <div className="mt-1 text-xs text-textmuted">
                  Visit by appointment or for official coordination.
                </div>
              </div>
              <div className="aspect-[16/10]">
                <iframe
                  title="Office Map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    office.addressMapQuery
                  )}&output=embed`}
                />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-border bg-muted/55 p-8 shadow-sm backdrop-blur-[2px]"
            >
              <div className="flex items-center gap-3">
                <IconBox>
                  <ClockIcon className="h-5 w-5" />
                </IconBox>
                <div>
                  <div className="text-xs font-semibold text-textmuted">Office hours</div>
                  <div className="text-sm font-semibold text-textmain">Working schedule</div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-textmuted">
                    <tr>
                      <th className="p-3 text-left font-semibold">Day</th>
                      <th className="p-3 text-left font-semibold">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="text-textmain">
                    {office.hours.map((row) => (
                      <tr key={row.day} className="border-t border-border">
                        <td className="p-3 font-semibold">{row.day}</td>
                        <td className="p-3 text-textmuted">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.aside>

          <motion.div variants={fadeRight} className="space-y-6 lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface/85 shadow-sm backdrop-blur-[2px]">
              <div className="border-b border-border bg-muted/35 p-8 md:p-10">
                <h2 className="text-2xl font-semibold text-primary md:text-3xl">Send us a message</h2>
                <p className="mt-3 text-textmuted">
                  We welcome inquiries about research, partnerships, training, data access,
                  publications, and disaster-related information support.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6 p-8 md:p-10">
                <AnimatePresence mode="wait">
                  {status.type !== "idle" && (
                    <motion.div
                      key={status.type + status.message}
                      initial={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                      className={`rounded-xl border p-4 text-sm ${
                        status.type === "success"
                          ? "border-green-100 bg-green-50 text-green-800"
                          : status.type === "sending"
                          ? "border-blue-100 bg-blue-50 text-blue-800"
                          : "border-red-100 bg-red-50 text-red-800"
                      }`}
                    >
                      {status.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full name">
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      type="text"
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/40"
                    />
                  </Field>

                  <Field label="Email address">
                    <input
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/40"
                    />
                  </Field>
                </div>

                <Field label="Subject (optional)">
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    type="text"
                    placeholder="Partnership, research, training, data request..."
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/40"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/40"
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-textmuted">
                    Please do not include confidential or highly sensitive personal information.
                  </p>

                  <motion.button
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    type="submit"
                    disabled={status.type === "sending"}
                    className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95 disabled:opacity-60"
                  >
                    {status.type === "sending" ? "Sending..." : "Send message"}
                  </motion.button>
                </div>
              </form>
            </div>

            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-border bg-muted/55 p-8 shadow-sm backdrop-blur-[2px]"
            >
              <h3 className="text-xl font-semibold text-primary md:text-2xl">Frequently Asked Questions</h3>
              <p className="mt-2 text-sm text-textmuted">
                Quick answers to common inquiries.
              </p>

              <div className="mt-6 space-y-3">
                {faqItems.map((item, idx) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} delay={idx * 0.03} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-10 text-white shadow-lg md:p-12"
          >
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-semibold md:text-3xl">
                  Want to share field information?
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-white/90">
                  Submit structured field reports to support verified disaster information,
                  analysis, and evidence-based response planning.
                </p>
              </div>

              <Link
                to="/submit-report"
                className="rounded-xl bg-accent px-7 py-3 font-semibold text-accenttext transition hover:brightness-95"
              >
                Submit Field Report
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-textmain">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function IconBox({ children }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary">
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <IconBox>{icon}</IconBox>
      <div>
        <div className="text-xs font-semibold text-textmuted">{label}</div>
        <div className="mt-1 text-sm font-semibold text-textmain">{value}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay }}
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted"
      >
        <span className="font-semibold text-textmain">{q}</span>
        <span className="text-xs font-semibold text-textmuted">{open ? "Hide" : "Show"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
          >
            <div className="px-5 pb-5 text-sm leading-relaxed text-textmuted">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h3l2 6-2 1c1.2 2.6 3.4 4.8 6 6l1-2 6 2v3c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 5c0-1.1.9-2 2-2h2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}