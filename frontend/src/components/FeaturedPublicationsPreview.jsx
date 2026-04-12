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

function isPdfUrl(url = "") {
  const u = String(url).toLowerCase();
  return u.includes(".pdf") || u.includes("pdf");
}

function pickPdfUrl(attachments = []) {
  if (!Array.isArray(attachments)) return null;
  return attachments.find((u) => isPdfUrl(u)) || null;
}

function TagPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-textmain">
      {children}
    </span>
  );
}

export default function FeaturedPublicationsPreview({
  limit = 3,
  intervalMs = 6000,
}) {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/articles`, {
          params: { category: "publication", limit },
        });

        const raw = Array.isArray(res.data?.items) ? res.data.items : [];
        if (!alive) return;

        setArticles(raw);
        setIndex(0);
      } catch (e) {
        console.error("Failed to fetch publications:", e);
        if (alive) setArticles([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchArticles();
    return () => {
      alive = false;
    };
  }, [limit]);

  useEffect(() => {
    if (paused) return;
    if (!articles || articles.length <= 1) return;

    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % articles.length);
    }, intervalMs);

    return () => clearInterval(t);
  }, [paused, articles, intervalMs]);

  const safeIndex = articles.length ? index % articles.length : 0;
  const current = articles[safeIndex];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
  };

  if (loading) {
    return (
      <section className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="mx-auto w-full max-w-[820px]">
            <div className="rounded-2xl border border-border bg-white h-[360px] shadow-[0_18px_50px_rgba(15,23,42,0.08)]" />
          </div>

          <div>
            <div className="h-4 w-32 rounded bg-border/60" />
            <div className="mt-6 h-10 w-72 rounded bg-border/60" />
            <div className="mt-6 h-4 w-full rounded bg-border/60" />
            <div className="mt-3 h-4 w-5/6 rounded bg-border/60" />
          </div>
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-sm font-semibold uppercase tracking-wide text-textmuted">
            Publications
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-primary">
            Featured research publications
          </h2>
          <p className="mt-4 text-textmuted">
            No publications available yet.
          </p>
        </div>
      </section>
    );
  }

  const pdfUrl = pickPdfUrl(current.attachments || []);
  const published = formatDate(current.publishDate || current.createdAt);
  const tags = Array.isArray(current.tags)
    ? current.tags.filter(Boolean).slice(0, 2)
    : [];

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* CARD FIRST ON DESKTOP */}
        <div
          className="order-2 lg:order-1 relative mx-auto w-full max-w-[820px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="rounded-[24px] border border-border bg-white p-3 md:p-4 shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
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
                <div className="grid md:grid-cols-[260px_1fr]">
                  {/* COVER */}
                  <div className="relative h-[220px] md:h-full bg-muted">
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
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-accent/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-accenttext border border-black/10">
                        Publication
                      </span>

                      {published && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-textmuted">
                          {published}
                        </span>
                      )}

                      {pdfUrl && (
                        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold text-textmain">
                          PDF
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl md:text-[24px] font-semibold leading-tight text-textmain line-clamp-2">
                      {current.title}
                    </h3>

                    {current.subtitle ? (
                      <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-textmuted line-clamp-2">
                        {current.subtitle}
                      </p>
                    ) : null}

                    <p className="mt-4 text-sm md:text-[15px] leading-relaxed text-textmain/80 line-clamp-3">
                      {current.excerpt || "Click to read the full publication."}
                    </p>

                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <TagPill key={tag}>{tag}</TagPill>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
                        >
                          Open PDF
                        </a>
                      )}

                      <button
                        onClick={() => navigate(`/research/${current.slug}`)}
                        className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-textmain transition hover:bg-muted"
                      >
                        Read publication
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {articles.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setDirection(-1);
                    setIndex((i) => (i - 1 + articles.length) % articles.length);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-textmain transition hover:bg-muted"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-2">
                  {articles.map((_, i) => (
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
                      aria-label={`Go to publication slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDirection(1);
                    setIndex((i) => (i + 1) % articles.length);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-textmain transition hover:bg-muted"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TEXT SECOND ON DESKTOP */}
        <div className="order-1 lg:order-2 lg:pt-4">
          <div className="text-sm font-semibold uppercase tracking-wide text-textmuted">
            Publications
          </div>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-primary">
            Featured research publications
          </h2>

          <div className="mt-5 h-1 w-20 rounded-full bg-primary" />

          <p className="mt-8 max-w-md text-lg leading-relaxed text-textmuted">
            Preview selected research outputs, briefs, and analytical publications
            designed to support disaster risk governance, planning, and
            evidence-based decision-making.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/research?tab=publication"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              View all publications
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}