import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { motion, useReducedMotion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function readingTimeFromHtml(html = "") {
  const text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text ? text.split(" ").length : 0;
  const WPM = 220;

  if (words < 50) return "Less than 1 min read";
  const minutes = Math.ceil(words / WPM);
  return `${minutes} min read`;
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

function badgeClass(cat) {
  return cat === "news"
    ? "bg-secondary text-white border-white/15 dark:bg-secondary dark:text-slate-900 dark:border-black/10"
    : "bg-accent text-accenttext border-black/10";
}

function TagPill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-semibold text-textmain">
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

function injectFirstImageAfterParagraph(html = "", imageUrl = "", afterParagraph = 2) {
  if (!html || !imageUrl) return { html, used: false };

  const parts = String(html).split("</p>");
  let used = false;

  const out = parts.map((chunk, idx) => {
    const paragraphIndex = idx + 1;
    let s = chunk;

    if (idx < parts.length - 1) s += "</p>";

    if (!used && paragraphIndex === afterParagraph) {
      s += `
        <figure class="not-prose my-12">
          <img
            src="${imageUrl}"
            alt="Article image"
            class="w-full rounded-[28px] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] object-cover shadow-sm"
          />
        </figure>
      `;
      used = true;
    }
    return s;
  });

  return { html: out.join(""), used };
}

function overlapScore(aTags = [], bTags = []) {
  const A = new Set((Array.isArray(aTags) ? aTags : []).map(String));
  const B = new Set((Array.isArray(bTags) ? bTags : []).map(String));
  let score = 0;
  for (const t of A) if (B.has(t)) score += 1;
  return score;
}

export default function ResearchArticle() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();

  const [article, setArticle] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchBySlug = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/articles/slug/${slug}`);
        if (!alive) return;
        setArticle(res.data);
      } catch (e) {
        console.error(e);
        if (alive) setArticle(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchBySlug();
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const meta = useMemo(() => {
    if (!article) return null;
    return {
      readTime: readingTimeFromHtml(article.content),
      pdfUrl: pickPdfUrl(article.attachments || []),
      published: article.publishDate ? new Date(article.publishDate).toDateString() : "—",
    };
  }, [article]);

  const view = useMemo(() => {
    if (!article) return { safeHtml: "", remainingImages: [] };

    const imgs = Array.isArray(article.images) ? article.images.filter(Boolean) : [];
    const first = imgs[0] || "";

    const injected = first
      ? injectFirstImageAfterParagraph(article.content || "", first, 2)
      : { html: article.content || "", used: false };

    const remainingImages = injected.used ? imgs.slice(1) : imgs;
    const safeHtml = DOMPurify.sanitize(injected.html);

    return { safeHtml, remainingImages };
  }, [article]);

  useEffect(() => {
    if (!article?._id) return;

    let alive = true;

    (async () => {
      setRelatedLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/articles`, {
          params: {
            category: article.category,
            limit: 24,
            page: 1,
          },
        });

        if (!alive) return;

        const all = Array.isArray(res.data?.items) ? res.data.items : [];
        const candidates = all.filter((a) => a && a.slug && a.slug !== article.slug);

        const ranked = candidates
          .map((a) => ({
            a,
            score:
              overlapScore(article.tags, a.tags) +
              (a.category === article.category ? 2 : 0),
            publishedAt: a.publishDate ? new Date(a.publishDate).getTime() : 0,
          }))
          .sort((x, y) => {
            if (y.score !== x.score) return y.score - x.score;
            return y.publishedAt - x.publishedAt;
          })
          .slice(0, 3)
          .map((x) => x.a);

        setRelated(ranked);
      } catch (e) {
        console.error(e);
        if (alive) setRelated([]);
      } finally {
        if (alive) setRelatedLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [article]);

  if (loading) {
    return (
      <main className="bg-background text-textmain">
        <section className="relative overflow-hidden py-28">
          <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
          <div className="pointer-events-none absolute -top-20 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-6">
            <div className="rounded-3xl border border-border bg-muted/55 p-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
              <p className="mt-5 text-textmuted">Loading article...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="bg-background text-textmain">
        <section className="relative overflow-hidden py-28">
          <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
          <div className="pointer-events-none absolute -top-20 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-6">
            <div className="rounded-3xl border border-border bg-muted/55 p-10 text-center shadow-sm">
              <h1 className="text-2xl font-semibold text-primary">Article not found</h1>
              <p className="mt-3 text-textmuted">
                The article you are looking for may have been removed or is no longer available.
              </p>
              <div className="mt-6">
                <Link
                  to="/research"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary"
                >
                  Back to research
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <div
        className="fixed left-0 top-0 z-[999999] h-1 bg-secondary"
        style={{ width: `${scrollProgress}%` }}
      />

      <main className="bg-background text-textmain">
        <section className="relative overflow-hidden pt-12 pb-16">
          <div className="absolute inset-0 bg-surface/75 dark:bg-surface/60 backdrop-blur-[2px]" />
          <div className="pointer-events-none absolute -top-20 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <li>
                  <Link
                    to="/"
                    className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-textmain transition hover:bg-muted"
                  >
                    Home
                  </Link>
                </li>
                <li className="text-textmuted">/</li>
                <li>
                  <Link
                    to="/research"
                    className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-textmain transition hover:bg-muted"
                  >
                    Research
                  </Link>
                </li>
                <li className="text-textmuted">/</li>
                <li className="max-w-[18rem] truncate text-textmuted sm:max-w-[28rem]">
                  {article.title}
                </li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                    article.category
                  )}`}
                >
                  {categoryLabel(article.category)}
                </span>
                <span className="text-xs text-textmuted">Published: {meta.published}</span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.02] text-primary md:text-5xl xl:text-7xl">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-textmuted md:text-xl">
                  {article.subtitle}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-5 text-sm text-textmuted">
                <span>
                  <span className="font-semibold text-textmain">By:</span>{" "}
                  {article.authorName || "—"}
                </span>
                <span>{meta.readTime}</span>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                {meta.pdfUrl && (
                  <a
                    href={meta.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-accent px-6 py-3 font-semibold text-accenttext transition hover:brightness-95"
                  >
                    Open PDF
                  </a>
                )}

                <Link
                  to="/research"
                  className="rounded-xl border border-border bg-surface/70 px-6 py-3 font-semibold text-textmain backdrop-blur transition hover:bg-muted"
                >
                  ← Back to list
                </Link>
              </div>
            </div>

            <div className="mt-12">
              <div className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-sm">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="h-[22rem] w-full object-cover md:h-[32rem] xl:h-[42rem]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[22rem] items-center justify-center text-sm text-textmuted md:h-[32rem] xl:h-[42rem]">
                    No cover image
                  </div>
                )}
              </div>

              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {article.tags.map((t) => (
                    <TagPill key={t}>{t}</TagPill>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div
            className="
              prose prose-slate mx-auto max-w-4xl px-6
              prose-lg
              prose-headings:font-semibold
              prose-headings:text-primary
              prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-3xl
              prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-2xl
              prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-xl
              prose-p:my-6 prose-p:leading-8 prose-p:text-[17px]
              prose-a:text-secondary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-textmain
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:leading-8
              prose-blockquote:my-10
              prose-blockquote:rounded-r-2xl
              prose-blockquote:border-l-4
              prose-blockquote:border-accent
              prose-blockquote:bg-accent/10
              prose-blockquote:py-4
              prose-blockquote:px-6
              prose-blockquote:font-normal
              prose-blockquote:text-textmain
              prose-img:my-10
              prose-img:w-full
              prose-img:rounded-[28px]
              prose-img:border
              prose-img:border-border
              prose-img:shadow-sm
              max-w-none
            "
            dangerouslySetInnerHTML={{ __html: view.safeHtml }}
          />

          {Array.isArray(view.remainingImages) && view.remainingImages.length > 0 && (
            <div className="mx-auto mt-16 max-w-5xl px-6">
              <h2 className="text-xl font-semibold text-textmain">Photos</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {view.remainingImages.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt="Article photo"
                      className="h-48 w-full rounded-2xl border border-border bg-surface object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-secondary/12 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-primary md:text-3xl">
                  Related {article.category === "news" ? "news" : "publications"}
                </h3>
                <p className="mt-2 text-textmuted">
                  Additional items you may find useful.
                </p>
              </div>

              <Link to="/research" className="font-semibold text-secondary hover:underline">
                View all →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {relatedLoading ? (
                [0, 1, 2].map((i) => (
                  <div key={i} className="rounded-3xl border border-border bg-white/85 p-7 shadow-sm">
                    <div className="h-4 w-24 rounded bg-border/60" />
                    <div className="mt-4 h-6 w-3/4 rounded bg-border/60" />
                    <div className="mt-3 h-4 w-full rounded bg-border/60" />
                  </div>
                ))
              ) : related.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-border bg-white/85 p-10 text-center text-textmuted shadow-sm">
                  No related items available yet.
                </div>
              ) : (
                related.map((a, idx) => (
                  <motion.article
                    key={a._id}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: idx * 0.04 }}
                    className="rounded-3xl border border-border bg-white/90 p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                          a.category
                        )}`}
                      >
                        {categoryLabel(a.category)}
                      </span>
                      <span className="text-xs text-textmuted">
                        {a.publishDate ? new Date(a.publishDate).toDateString() : "—"}
                      </span>
                    </div>

                    <h4 className="mt-4 line-clamp-2 font-semibold text-textmain">{a.title}</h4>

                    {a.excerpt ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-textmuted">
                        {a.excerpt}
                      </p>
                    ) : null}

                    <div className="mt-5">
                      <Link
                        to={`/research/${a.slug}`}
                        className="font-semibold text-secondary hover:underline"
                      >
                        Read →
                      </Link>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}