import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatRange(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const opts = { year: "numeric", month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} - ${e.toLocaleDateString(undefined, opts)}`;
}

function durationDays(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const sDay = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  const eDay = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  const diff = Math.round((eDay - sDay) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : null;
}

function formatTimeRange(startTime, endTime) {
  const st = String(startTime || "").trim();
  const et = String(endTime || "").trim();
  if (!st && !et) return "—";
  if (st && et) return `${st} - ${et}`;
  return st || et || "—";
}

export default function Training() {
  const reduceMotion = useReducedMotion();

  const slides = [
    {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2200&q=80",
      alt: "Training workshop session",
    },
    {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2200&q=80",
      alt: "Collaborative training and team learning",
    },
    {
      src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
      alt: "Research methods and planning",
    },
  ];

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reduceMotion, slides.length]);

  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/trainings/public/upcoming?limit=9`);
      setTrainings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const areas = useMemo(
    () => [
      {
        title: "Disaster data analytics and insights",
        desc: "Training on data-driven approaches for analyzing risks, trends, impacts, and decision-support needs.",
        Icon: BadgeIcon,
      },
      {
        title: "Flood risk management",
        desc: "Learning on flood patterns, impacts, vulnerability analysis, and planning for flood risk reduction.",
        Icon: BadgeIcon,
      },
      {
        title: "Climate change and resilience",
        desc: "Capacity building on climate-related disaster risks, adaptation thinking, and resilience planning.",
        Icon: BadgeIcon,
      },
      {
        title: "Urban disaster risks",
        desc: "Training focused on urban vulnerability, infrastructure exposure, and city-specific emergency challenges.",
        Icon: BadgeIcon,
      },
      {
        title: "Health emergencies and outbreaks",
        desc: "Orientation on health-related emergencies, outbreak risks, preparedness needs, and information use.",
        Icon: BadgeIcon,
      },
      {
        title: "Conflict, displacement, and risk information",
        desc: "Training on understanding conflict-related risks, displacement issues, and information support for response and planning.",
        Icon: BadgeIcon,
      },
    ],
    []
  );

  return (
    <main className="bg-background text-textmain">
      {/* HERO */}
      <section className="relative -mt-20 flex h-[66vh] min-h-[560px] items-center justify-center overflow-hidden pt-20 text-white">
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

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Capacity building • workshops • professional training
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-tight">
            Training and workshops
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">
            Strengthening disaster risk reduction capability through structured training,
            data-informed learning, and practical workshops for institutions, professionals,
            and communities across Nigeria.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
            >
              Get in touch
            </Link>

            <Link
              to="/programs"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View programs
            </Link>
          </div>

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
        </div>
      </section>

      {/* INTRO */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 grid gap-10 lg:grid-cols-[1fr_0.9fr] items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Overview
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              About our training programs
            </h2>

            <p className="mt-5 leading-relaxed text-textmuted">
              The Center’s training and capacity building activities are designed to
              strengthen data-driven disaster risk reduction capability across institutions,
              professional communities, researchers, and local stakeholders.
            </p>

            <p className="mt-4 leading-relaxed text-textmuted">
              Through workshops, technical sessions, and structured learning opportunities,
              participants gain practical knowledge in disaster data analytics, information
              management, research methods, preparedness support, and evidence-based decision-making.
            </p>
          </div>

          <div className="rounded-[28px] border border-border bg-muted/60 p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-textmain">What participants gain</h3>

            <ul className="mt-4 space-y-3 text-sm text-textmuted">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Practical tools for disaster data collection, analysis, and information management
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Evidence-based approaches to preparedness, risk reduction, and decision support
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Stronger institutional capacity for research, reporting, and stakeholder collaboration
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={fetchUpcoming}
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-surface"
              >
                Refresh upcoming list
              </button>

              <Link
                to="/submit-report"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                Submit a field report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRAINING AREAS */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-muted/60 dark:bg-muted/45 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/12 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              Training areas
            </div>

            <h2 className="mt-5 text-2xl md:text-4xl font-semibold text-primary">
              Curriculum and focus areas
            </h2>
            <p className="mt-4 max-w-3xl mx-auto leading-relaxed text-textmuted">
              Training themes designed to support government agencies, humanitarian
              actors, research institutions, professional communities, and local stakeholders.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <div
                key={a.title}
                className="rounded-[28px] border border-border bg-surface/70 p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-primary text-white dark:border-black/10 dark:bg-accent dark:text-accenttext">
                  <a.Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 font-semibold text-textmain">{a.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-textmuted">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
                Upcoming sessions
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
                Published upcoming workshops
              </h2>
              <p className="mt-2 text-textmuted">
                Only approved and published upcoming workshops are displayed here.
              </p>
            </div>

            <button
              onClick={fetchUpcoming}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Refresh
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] border border-border bg-muted/55 p-7 shadow-sm"
                >
                  <div className="h-5 w-3/4 rounded bg-border/70" />
                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-1/2 rounded bg-border/60" />
                    <div className="h-4 w-1/3 rounded bg-border/60" />
                    <div className="h-4 w-2/3 rounded bg-border/60" />
                  </div>
                  <div className="mt-6 h-11 w-full rounded-xl bg-border/60" />
                </div>
              ))
            ) : trainings.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-border bg-muted/60 p-10 text-center text-textmuted">
                No upcoming workshops published yet.
              </div>
            ) : (
              trainings.map((t) => {
                const days = durationDays(t.startDate, t.endDate);
                const timeText = formatTimeRange(t.startTime, t.endTime);

                return (
                  <div
                    key={t._id}
                    className="rounded-[28px] border border-border bg-muted/55 p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="text-xl font-semibold text-textmain">{t.title}</div>

                    <div className="mt-5 space-y-3 text-sm text-textmuted">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-textmuted" />
                        <span>{formatRange(t.startDate, t.endDate)}</span>
                      </div>

                      {days ? (
                        <div className="flex items-center gap-3">
                          <ClockIcon className="h-5 w-5 text-textmuted" />
                          <span>{days} {days === 1 ? "Day" : "Days"}</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-3">
                        <TimeIcon className="h-5 w-5 text-textmuted" />
                        <span>{timeText}</span>
                      </div>

                      {t.facilitatorName ? (
                        <div className="flex items-center gap-3">
                          <PersonIcon className="h-5 w-5 text-textmuted" />
                          <span>
                            <span className="font-semibold text-textmain">Facilitator:</span>{" "}
                            {t.facilitatorName}
                          </span>
                        </div>
                      ) : null}

                      {t.participants ? (
                        <div className="flex items-center gap-3">
                          <UsersIcon className="h-5 w-5 text-textmuted" />
                          <span>{t.participants} participants</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-3">
                        <PinIcon className="h-5 w-5 text-textmuted" />
                        <span>{t.location}</span>
                      </div>
                    </div>

                    {t.summary ? (
                      <p className="mt-6 leading-relaxed text-textmuted">{t.summary}</p>
                    ) : null}

                    <a
                      href={t.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-secondary"
                    >
                      Register now
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-10 md:p-14 text-white shadow-lg">
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative text-center">
              <h3 className="text-2xl md:text-4xl font-semibold">
                Interested in our training programs?
              </h3>
              <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-white/85">
                Contact the Center to learn more about upcoming workshops,
                participation opportunities, and tailored capacity-building support
                for institutions and stakeholders.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
                >
                  Get in touch
                </Link>

                <Link
                  to="/programs"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  View programs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Icons */
function BadgeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 19 6v7c0 5-3 8.5-7 9-4-.5-7-4-7-9V6l7-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 2v3M17 2v3M3.5 9h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function TimeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 20.5a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 10.5a3.5 3.5 0 1 1 0-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 20.5a6.5 6.5 0 0 0-7-6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s7-4.4 7-12a7 7 0 1 0-14 0c0 7.6 7 12 7 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}