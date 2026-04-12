import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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

function Badge({ children, subtle = false }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border",
        subtle
          ? "bg-surface border-border text-textmain"
          : "bg-accent/90 border-black/10 text-accenttext",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MetaLine({ authorName, category }) {
  const label = category === "news" ? "News Desk" : "Research Unit";
  const author = (authorName || "").trim() || label;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-textmuted">
      <span className="inline-flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21a8 8 0 1 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="font-semibold text-textmain">By:</span> {author}
      </span>
    </div>
  );
}

function TagPill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-textmain">
      {children}
    </span>
  );
}

export default function PublicationsPreviewDynamic({
  category = "publication",
  limit = 3,
  intervalMs = 5500,
}) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const meta = useMemo(() => {
    const isNews = category === "news";
    return {
      isNews,
      title: isNews ? "Latest news & updates" : "Recent research publications",
      description: isNews
        ? "Official updates, field briefs, announcements, and platform communications."
        : "Policy-grade research outputs curated for disaster governance, planning, and evidence-based decision support.",
      viewAllHref: isNews ? "/research?tab=news" : "/research?tab=publication",
      typeBadge: isNews ? "News" : "Publication",
      sectionBg: isNews ? "bg-muted" : "bg-surface",
    };
  }, [category]);

  useEffect(() => {
    let alive = true;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/articles`, {
          params: { category, limit },
        });

        const raw = Array.isArray(res.data?.items) ? res.data.items : [];

        const sorted = raw
          .slice()
          .sort(
            (a, b) =>
              new Date(b.publishDate || b.createdAt || 0) -
              new Date(a.publishDate || a.createdAt || 0)
          );

        if (!alive) return;
        setArticles(sorted);
        setIndex(0);
      } catch (e) {
        console.error(`Failed to fetch ${category}:`, e);
        if (alive) setArticles([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchArticles();
    return () => {
      alive = false;
    };
  }, [category, limit]);

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
    enter: (dir) => ({ x: dir > 0 ? 70 : -70, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -70 : 70, opacity: 0 }),
  };

  if (loading) {
    return (
      <section className={`${meta.sectionBg} py-24`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-10 w-72 rounded bg-border/60" />
          <div className="mt-4 h-4 w-[520px] max-w-full rounded bg-border/60" />
          <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="h-64 bg-border/60" />
            <div className="space-y-4 p-10">
              <div className="h-5 w-2/3 rounded bg-border/60" />
              <div className="h-4 w-1/2 rounded bg-border/60" />
              <div className="h-4 w-full rounded bg-border/60" />
              <div className="h-4 w-5/6 rounded bg-border/60" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className={`${meta.sectionBg} py-24`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
                {meta.typeBadge}
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
                {meta.title}
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-textmuted">
                {meta.description}
              </p>
            </div>

            <Link to={meta.viewAllHref} className="font-semibold text-secondary hover:underline">
              View all →
            </Link>
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-surface p-10 text-center text-textmuted shadow-sm">
            No {meta.isNews ? "news items" : "publications"} available yet.
          </div>
        </div>
      </section>
    );
  }

  const pdfUrl = pickPdfUrl(current.attachments || []);
  const published = formatDate(current.publishDate || current.createdAt);
  const tags = Array.isArray(current.tags) ? current.tags.filter(Boolean) : [];
  const topTags = tags.slice(0, 3);

  return (
    <section className={`${meta.sectionBg} py-24`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
              {meta.typeBadge}
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-primary">
              {meta.title}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-textmuted">
              {meta.description}
            </p>
          </div>

          <Link to={meta.viewAllHref} className="font-semibold text-secondary hover:underline">
            View all →
          </Link>
        </div>

        <div
          className="mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.article
              key={current._id || safeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`overflow-hidden rounded-3xl border border-border shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${
                meta.isNews ? "bg-muted" : "bg-surface"
              }`}
            >
              <div className={`${meta.isNews ? "grid lg:grid-cols-[1.15fr_1fr]" : ""}`}>
                <div className={`relative ${meta.isNews ? "h-72 md:h-full min-h-[320px]" : "h-64 md:h-72"} bg-muted`}>
                  {current.coverImage ? (
                    <img
                      src={current.coverImage}
                      alt={current.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-textmuted">
                      No cover
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                    <Badge>{meta.typeBadge}</Badge>
                    {published ? <Badge subtle>{published}</Badge> : null}
                    {pdfUrl && !meta.isNews ? <Badge subtle>PDF</Badge> : null}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3 className="line-clamp-2 text-2xl md:text-3xl font-semibold leading-tight text-white">
                      {current.title}
                    </h3>

                    {current.subtitle ? (
                      <p className="mt-2 line-clamp-2 text-sm md:text-base text-white/85">
                        {current.subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <p className="line-clamp-4 leading-relaxed text-textmain/80">
                    {current.excerpt || "Click to read the full item."}
                  </p>

                  <MetaLine authorName={current.authorName} category={category} />

                  {topTags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {topTags.map((t) => (
                        <TagPill key={t}>{t}</TagPill>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {pdfUrl && !meta.isNews ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-95"
                      >
                        Open PDF
                      </a>
                    ) : null}

                    <button
                      onClick={() => navigate(`/research/${current.slug}`)}
                      className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textmain transition hover:bg-muted"
                    >
                      Read →
                    </button>

                    {articles.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setDirection(-1);
                            setIndex((i) => (i - 1 + articles.length) % articles.length);
                          }}
                          className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textmain transition hover:bg-muted"
                        >
                          ← Prev
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDirection(1);
                            setIndex((i) => (i + 1) % articles.length);
                          }}
                          className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textmain transition hover:bg-muted"
                        >
                          Next →
                        </button>
                      </>
                    )}
                  </div>

                  {articles.length > 1 && (
                    <div className="mt-6 flex gap-2">
                      {articles.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDirection(i > safeIndex ? 1 : -1);
                            setIndex(i);
                          }}
                          className={`h-2.5 w-2.5 rounded-full transition ${
                            i === safeIndex ? "bg-accent" : "bg-border hover:bg-border/80"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-textmuted">
                    {paused ? "Paused (hover)" : "Auto-sliding"} • Showing latest {articles.length} item(s)
                  </p>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}