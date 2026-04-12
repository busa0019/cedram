import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toDateString();
}

export default function LatestNewsPreview({
  limit = 4,
  intervalMs = 5000,
}) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/articles`, {
          params: { category: "news", limit },
        });

        const raw = Array.isArray(res.data?.items) ? res.data.items : [];
        if (!alive) return;

        setItems(raw);
        setIndex(0);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      alive = false;
    };
  }, [limit]);

  useEffect(() => {
    if (paused) return;
    if (!items || items.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [paused, items, intervalMs]);

  const safeIndex = items.length ? index % items.length : 0;
  const current = items[safeIndex];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  if (loading) {
    return (
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div>
            <div className="h-4 w-28 rounded bg-border/60" />
            <div className="mt-6 h-10 w-56 rounded bg-border/60" />
            <div className="mt-6 h-4 w-full rounded bg-border/60" />
            <div className="mt-3 h-4 w-5/6 rounded bg-border/60" />
          </div>

          <div className="mx-auto w-full max-w-[760px]">
            <div className="rounded-2xl border border-border bg-surface h-[360px] shadow-[0_18px_50px_rgba(15,23,42,0.08)]" />
          </div>
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
            News & Updates
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
            Latest updates from CEDRAM
          </h2>
          <p className="mt-4 text-textmuted">
            No updates available yet.
          </p>
        </div>
      </section>
    );
  }

  const published = formatDate(current.publishDate || current.createdAt);

  return (
    <section className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="order-1 lg:pt-4">
          <div className="text-sm font-semibold uppercase tracking-wide text-textmuted">
            News & Updates
          </div>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-primary">
            Latest updates from CEDRAM
          </h2>

          <div className="mt-5 h-1 w-20 rounded-full bg-primary" />

          <p className="mt-8 max-w-md text-lg leading-relaxed text-textmuted">
            Stay informed with recent announcements, updates, field briefs, and institutional
            communications from CEDRAM. You can also explore the full{" "}
            <Link to="/research?tab=news" className="text-primary hover:underline">
              news
            </Link>{" "}
            and{" "}
            <Link
              to="/research?tab=publications"
              className="text-primary hover:underline"
            >
              publication
            </Link>{" "}
            archive.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/research?tab=news"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              View all news
            </Link>
          </div>
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="order-2 relative mx-auto w-full max-w-[760px]"
        >
          <div className="rounded-2xl border border-border bg-white p-3 md:p-4 shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current._id || safeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-[18px] border border-border bg-white"
              >
                <div className="relative h-[180px] md:h-[200px] bg-muted">
                  {current.coverImage ? (
                    <img
                      src={current.coverImage}
                      alt={current.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-textmuted">
                      No cover
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="px-4 py-5 md:px-5 md:py-6">
                  {published && (
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-textmuted">
                      {published}
                    </div>
                  )}

                  <h3 className="mt-3 text-lg md:text-[22px] font-semibold leading-tight text-textmain">
                    {current.title}
                  </h3>

                  {current.subtitle ? (
                    <p className="mt-2 text-sm text-textmuted line-clamp-1">
                      {current.subtitle}
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm md:text-base leading-relaxed text-primary/80 line-clamp-3">
                    {current.excerpt || "Open this update to read the full content."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/research/${current.slug}`)}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
                    >
                      Read more
                    </button>

                    <Link
                      to="/research?tab=news"
                      className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-textmain transition hover:bg-muted"
                    >
                      View archive
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setDirection(-1);
                    setIndex((i) => (i - 1 + items.length) % items.length);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-textmain transition hover:bg-muted"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDirection(i > safeIndex ? 1 : -1);
                        setIndex(i);
                      }}
                      className={`h-2.5 rounded-full transition ${
                        i === safeIndex
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-border hover:bg-border/80"
                      }`}
                      aria-label={`Go to news slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDirection(1);
                    setIndex((i) => (i + 1) % items.length);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-textmain transition hover:bg-muted"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}