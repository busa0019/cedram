import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  BookOpen,
  Tags,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 6;

function StatusBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
      Draft
    </span>
  );
}

function CategoryBadge({ category }) {
  const isNews = category === "news";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        isNews
          ? "bg-blue-50 text-blue-700 border-blue-100"
          : "bg-emerald-50 text-emerald-700 border-emerald-100"
      }`}
    >
      {isNews ? "News" : "Publication"}
    </span>
  );
}

function isPdfUrl(url = "") {
  const u = String(url).toLowerCase();
  return u.includes(".pdf") || u.includes("pdf");
}

function hasPdf(attachments = []) {
  if (!Array.isArray(attachments)) return false;
  return attachments.some((u) => isPdfUrl(u));
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toDateString();
}

function AdminPublications() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/articles/admin`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setArticles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchArticles();
  }, [accessToken]);

  const sorted = useMemo(() => {
    return articles
      .slice()
      .sort(
        (a, b) =>
          new Date(b.publishDate || b.createdAt || 0) -
          new Date(a.publishDate || a.createdAt || 0)
      );
  }, [articles]);

  const uniqueTagsCount = useMemo(() => {
    const allTags = new Set();
    articles.forEach((article) => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach((tag) => {
          if (tag) allTags.add(String(tag).toLowerCase().trim());
        });
      }
    });
    return allTags.size;
  }, [articles]);

  const publishedCount = useMemo(
    () => articles.filter((a) => a.isPublished).length,
    [articles]
  );

  const filtered = useMemo(() => {
    return sorted.filter((article) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        article.title?.toLowerCase().includes(q) ||
        article.subtitle?.toLowerCase().includes(q) ||
        article.authorName?.toLowerCase().includes(q) ||
        article.created_by?.name?.toLowerCase().includes(q) ||
        article.tags?.some((tag) => String(tag).toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" ? true : article.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "published"
          ? article.isPublished
          : !article.isPublished;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [sorted, search, categoryFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const togglePublish = async (id) => {
    try {
      setActionId(id);
      await axios.put(
        `${API_URL}/api/articles/${id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchArticles();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update publish status");
    } finally {
      setActionId(null);
    }
  };

  const deleteArticle = async (id) => {
    const ok = window.confirm("Delete this item permanently?");
    if (!ok) return;

    try {
      setActionId(id);
      await axios.delete(`${API_URL}/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await fetchArticles();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Publications & News
          </h1>
          <p className="mt-2 text-slate-600">
            Manage research publications, documents, and public-facing content.
          </p>
        </div>

        <Link
          to="/admin/create-article"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-secondary"
        >
          <Plus size={18} />
          Add Publication
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryMiniCard
          title="Total Publications"
          value={articles.length}
          icon={<BookOpen size={18} />}
          color="text-primary"
        />
        <SummaryMiniCard
          title="Published"
          value={publishedCount}
          icon={<Newspaper size={18} />}
          color="text-blue-600"
        />
        <SummaryMiniCard
          title="Unique Tags"
          value={uniqueTagsCount}
          icon={<Tags size={18} />}
          color="text-amber-600"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title, author, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-primary"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="publication">Publications</option>
            <option value="news">News</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1080px]">
            <thead className="bg-slate-50">
              <tr className="text-slate-700">
                <th className="p-4 text-left font-semibold">Item</th>
                <th className="p-4 text-left font-semibold">Author</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Published</th>
                <th className="p-4 text-left font-semibold">Assets</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={7}>
                    Loading content...
                  </td>
                </tr>
              ) : paginatedArticles.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-slate-600" colSpan={7}>
                    No content found.
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const author =
                    article.authorName?.trim() ||
                    article.created_by?.name ||
                    "—";

                  const pdfAvailable = hasPdf(article.attachments || []);

                  return (
                    <tr
                      key={article._id}
                      className="border-t hover:bg-slate-50/60 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4 min-w-[320px]">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            {article.coverImage ? (
                              <img
                                src={article.coverImage}
                                alt={article.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                                No cover
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {article.title}
                            </div>
                            {article.subtitle && (
                              <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {article.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700">
                        <div className="font-semibold">{author}</div>
                        <div className="text-xs text-slate-500">
                          {article.created_by?.email || ""}
                        </div>
                      </td>

                      <td className="p-4">
                        <CategoryBadge category={article.category} />
                      </td>

                      <td className="p-4">
                        <StatusBadge published={article.isPublished} />
                      </td>

                      <td className="p-4 text-slate-700">
                        {formatDate(article.publishDate)}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {article.coverImage ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
                              Cover
                            </span>
                          ) : null}

                          {pdfAvailable ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                              PDF
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-100">
                              No PDF
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/edit-article/${article._id}`)
                            }
                            className="px-3 py-2 text-xs rounded-md border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => togglePublish(article._id)}
                            disabled={actionId === article._id}
                            className={`px-3 py-2 text-xs rounded-md font-semibold transition disabled:opacity-60 ${
                              article.isPublished
                                ? "bg-slate-700 text-white hover:bg-slate-800"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {actionId === article._id
                              ? "Working..."
                              : article.isPublished
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            onClick={() => deleteArticle(article._id)}
                            disabled={actionId === article._id}
                            className="px-3 py-2 text-xs rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryMiniCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${color}`}
      >
        {icon}
      </div>
      <div className={`mt-4 text-4xl font-semibold ${color}`}>{value}</div>
      <p className="mt-2 text-sm text-slate-600">{title}</p>
    </div>
  );
}

export default AdminPublications;