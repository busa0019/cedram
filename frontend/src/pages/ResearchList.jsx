import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PAGE_SIZE = 6;

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toDateString();
}

function isPdfUrl(url = "") {
  const u = String(url).toLowerCase();
  return u.includes(".pdf") || u.includes("pdf");
}

function pickPdfUrl(attachments = []) {
  if (!Array.isArray(attachments)) return null;
  return attachments.find((u) => isPdfUrl(u)) || null;
}

function categoryLabel(cat) {
  return cat === "news" ? "News" : "Publication";
}

function CategoryBadge({ category }) {
  const cls =
    category === "news"
      ? "bg-secondary text-white border-white/15 dark:bg-secondary dark:text-slate-900 dark:border-black/10"
      : "bg-accent text-accenttext border-black/10";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {categoryLabel(category)}
    </span>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 text-xs font-semibold rounded-full border transition",
        active
          ? "bg-accent text-accenttext border-black/10"
          : "bg-surface text-textmain border-border hover:bg-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function TagPill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted/70 border border-border text-textmain">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-textmuted"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20.59 13.41 12 22l-8.59-8.59A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.41.59l7.18 7.18a2 2 0 0 1 0 2.82Z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
      {children}
    </span>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl border border-border bg-surface font-semibold text-textmain hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="h-10 min-w-10 px-3 rounded-xl border text-sm font-semibold bg-surface text-textmain border-border hover:bg-muted transition"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-textmuted">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              "h-10 min-w-10 px-3 rounded-xl border text-sm font-semibold transition",
              p === page
                ? "bg-primary text-white border-primary"
                : "bg-surface text-textmain border-border hover:bg-muted",
            ].join(" ")}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-textmuted">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="h-10 min-w-10 px-3 rounded-xl border text-sm font-semibold bg-surface text-textmain border-border hover:bg-muted transition"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl border border-border bg-surface font-semibold text-textmain hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}

function ResearchList() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();

  const slides = useMemo(
    () => [
      {
        src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=2200&q=80",
        alt: "Satellite monitoring and national risk intelligence",
      },
      {
        src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
        alt: "Government briefing and decision support",
      },
      {
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=80",
        alt: "Data operations, analysis, and coordination",
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

  const initialTab = searchParams.get("tab") || "publication";
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialSearch = searchParams.get("q") || "";

  const [tab, setTab] = useState(
    ["publication", "news", "all"].includes(initialTab) ? initialTab : "publication"
  );
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);

  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const nextParams = {
      tab,
      page: String(page),
    };
    if (search.trim()) nextParams.q = search.trim();
    setSearchParams(nextParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, search]);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: page === 1 ? PAGE_SIZE + 1 : PAGE_SIZE,
        };

        if (tab === "publication") params.category = "publication";
        if (tab === "news") params.category = "news";
        if (search.trim()) params.search = search.trim();

        const res = await axios.get(`${API_URL}/api/articles`, { params });
        if (!alive) return;

        const payload = res.data || {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        const total = Number(payload.total) || 0;

        const featured = page === 1 && items.length > 0 ? items[0] : null;
        const visibleList = page === 1 ? items.slice(1) : items;

        setFeaturedArticle(featured);
        setListItems(visibleList);
        setTotalItems(total);

        const adjustedTotalPages = Math.max(1, Math.ceil(Math.max(0, total - 1) / PAGE_SIZE));
        setTotalPages(adjustedTotalPages);

        if (page > adjustedTotalPages) {
          setPage(adjustedTotalPages);
        }
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setFeaturedArticle(null);
        setListItems([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab, page, search]);

  const titleText =
    tab === "publication"
      ? "Research & Publications"
      : tab === "news"
      ? "News & Updates"
      : "Research, Publications & News";

  const subText =
    tab === "publication"
      ? "Access publications, policy briefs, and research outputs that support evidence-based disaster risk reduction across Nigeria."
      : tab === "news"
      ? "Updates and announcements from the Center—data releases, institutional activity, and public communications."
      : "Browse publications and news in one place—built for credibility, discoverability, and institutional use.";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
  };

  const cards = useMemo(() => {
    if (loading) return new Array(PAGE_SIZE).fill(null);
    return listItems;
  }, [loading, listItems]);

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
              className="absolute inset-0 w-full h-full object-cover"
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
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-black/25 border border-white/20">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Evidence • policy-grade research • public communication
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-tight">
            {titleText}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">
            {subText}
          </p>

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

      {/* FILTERS / SEARCH */}
      <section className="relative overflow-hidden py-10">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="rounded-[28px] border border-border bg-muted/55 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-accent px-3 py-1 text-xs font-semibold text-accenttext">
                  Browse content
                </div>

                <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-primary">
                  Filter publications and news
                </h2>
                <p className="mt-3 max-w-2xl text-textmuted leading-relaxed">
                  Explore policy briefs, research outputs, and news updates using category filters and keyword search.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <TabButton active={tab === "publication"} onClick={() => setTab("publication")}>
                  Publications
                </TabButton>
                <TabButton active={tab === "news"} onClick={() => setTab("news")}>
                  News
                </TabButton>
                <TabButton active={tab === "all"} onClick={() => setTab("all")}>
                  All
                </TabButton>
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, subtitle, author, excerpt, or tag..."
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-textmain placeholder:text-textmuted outline-none focus:ring-2 focus:ring-accent/60"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-accent text-accenttext font-semibold hover:brightness-95 transition"
              >
                Search
              </button>
              {(search || searchInput) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border text-textmain font-semibold hover:bg-surface transition"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {!loading && page === 1 && featuredArticle && (
        <section className="relative overflow-hidden pt-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-3xl border border-border bg-surface/80 backdrop-blur-[2px] shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-12 gap-0">
                <div className="lg:col-span-5">
                  <div className="h-full min-h-[320px] bg-muted">
                    {featuredArticle.coverImage ? (
                      <img
                        src={featuredArticle.coverImage}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[320px] flex items-center justify-center text-textmuted">
                        No cover image
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white border border-white/10">
                      Featured
                    </span>
                    <CategoryBadge category={featuredArticle.category} />
                    <span className="text-xs text-textmuted">
                      Published: {formatDate(featuredArticle.publishDate)}
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-primary">
                    {featuredArticle.title}
                  </h2>

                  {featuredArticle.subtitle && (
                    <p className="mt-4 text-textmuted text-lg leading-relaxed">
                      {featuredArticle.subtitle}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-4 text-sm text-textmuted">
                    <span>
                      <span className="font-semibold text-textmain">By:</span>{" "}
                      {featuredArticle.authorName || "—"}
                    </span>
                  </div>

                  {featuredArticle.excerpt && (
                    <p className="mt-5 text-textmuted leading-relaxed line-clamp-4">
                      {featuredArticle.excerpt}
                    </p>
                  )}

                  {Array.isArray(featuredArticle.tags) && featuredArticle.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {featuredArticle.tags.slice(0, 5).map((t) => (
                        <TagPill key={t}>{t}</TagPill>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap gap-3">
                    {pickPdfUrl(featuredArticle.attachments || []) && (
                      <a
                        href={pickPdfUrl(featuredArticle.attachments || [])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-accent text-accenttext font-semibold hover:brightness-95 transition"
                      >
                        Open PDF
                      </a>
                    )}

                    <button
                      onClick={() => navigate(`/research/${featuredArticle.slug}`)}
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition"
                    >
                      Read featured →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-primary">
                {tab === "publication"
                  ? "Latest publications"
                  : tab === "news"
                  ? "News updates"
                  : "All content"}
              </h2>
              <p className="mt-3 max-w-2xl text-textmuted leading-relaxed">
                {tab === "publication"
                  ? "Browse research publications and policy documents."
                  : tab === "news"
                  ? "Updates and announcements from the Center."
                  : "Publications and news in one place."}
              </p>
            </div>

            <div className="flex flex-col gap-3 items-start md:items-end">
              <p className="text-sm text-textmuted">
                Showing <span className="font-semibold text-textmain">{listItems.length}</span> on
                this page • <span className="font-semibold text-textmain">{totalItems}</span> total
                item{totalItems === 1 ? "" : "s"} • Page{" "}
                <span className="font-semibold text-textmain">{page}</span> of{" "}
                <span className="font-semibold text-textmain">{totalPages}</span>
              </p>

              <div className="flex gap-3">
                <Link
                  to="/insights"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border font-semibold text-textmain hover:bg-muted transition"
                >
                  Insights
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {cards.map((article, idx) => {
              if (!article) {
                return (
                  <div
                    key={idx}
                    className="rounded-3xl overflow-hidden border border-border bg-muted/55 backdrop-blur-[2px] shadow-sm"
                  >
                    <div className="grid lg:grid-cols-12">
                      <div className="lg:col-span-4 h-72 bg-border/60" />
                      <div className="lg:col-span-8 p-8">
                        <div className="h-4 w-36 bg-border/60 rounded" />
                        <div className="mt-4 h-8 w-2/3 bg-border/60 rounded" />
                        <div className="mt-4 h-5 w-1/2 bg-border/60 rounded" />
                        <div className="mt-6 h-4 w-full bg-border/60 rounded" />
                        <div className="mt-3 h-4 w-5/6 bg-border/60 rounded" />
                      </div>
                    </div>
                  </div>
                );
              }

              const pdfUrl = pickPdfUrl(article.attachments || []);

              return (
                <motion.article
                  key={article._id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.04, ease: "easeOut" }}
                  className="rounded-3xl overflow-hidden border border-border bg-surface/80 backdrop-blur-[2px] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition"
                >
                  <div className="grid lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <div className="h-full min-h-[260px] bg-muted">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[260px] flex items-center justify-center text-textmuted">
                            No cover image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-8 p-7 md:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryBadge category={article.category} />
                          <span className="text-xs text-textmuted">
                            Published: {formatDate(article.publishDate)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl md:text-3xl font-semibold text-textmain">
                          {article.title}
                        </h3>

                        {article.subtitle && (
                          <p className="mt-4 text-textmuted text-lg leading-relaxed">
                            {article.subtitle}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-4 text-sm text-textmuted">
                          <span>
                            <span className="font-semibold text-textmain">By:</span>{" "}
                            {article.authorName || "—"}
                          </span>
                        </div>

                        {Array.isArray(article.tags) && article.tags.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {article.tags.slice(0, 6).map((t) => (
                              <TagPill key={t}>{t}</TagPill>
                            ))}
                          </div>
                        )}

                        {article.excerpt && (
                          <p className="mt-6 text-textmuted leading-relaxed line-clamp-4 text-base md:text-lg">
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-accent text-accenttext font-semibold hover:brightness-95 transition"
                          >
                            Open PDF
                          </a>
                        )}

                        <button
                          onClick={() => navigate(`/research/${article.slug}`)}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border font-semibold text-textmain hover:bg-muted transition"
                        >
                          Read →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {!loading && !featuredArticle && listItems.length === 0 && (
            <div className="mt-10 bg-muted/55 backdrop-blur-[2px] border border-border rounded-3xl p-10 text-center">
              <h3 className="text-xl font-semibold text-textmain">No items found</h3>
              <p className="mt-3 text-textmuted max-w-xl mx-auto">
                There are no published items matching this tab or search yet. Try switching
                categories or clearing your search.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setTab("all");
                    clearSearch();
                  }}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition"
                >
                  View all content
                </button>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border font-semibold text-textmain hover:bg-muted transition"
                >
                  Contact
                </Link>
              </div>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-accent/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/12 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-white shadow-lg border border-white/10 bg-primary">
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div>
                <h3 className="text-2xl md:text-4xl font-semibold">
                  Contribute research or institutional updates
                </h3>
                <p className="mt-4 text-white/85 max-w-2xl leading-relaxed text-lg">
                  Collaborate with the Center on evidence generation, data sharing, and policy-grade
                  outputs.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-accent text-accenttext font-semibold hover:brightness-95 transition shadow-sm"
                >
                  Contact
                </Link>
                <Link
                  to="/submit-report"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition"
                >
                  Submit field report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ResearchList;