import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function isPdfUrl(url = "") {
  const u = String(url).toLowerCase();
  return u.includes(".pdf") || u.includes("pdf");
}

function buildTemplate(category = "publication") {
  const now = new Date().toDateString();

  if (category === "news") {
    return `## Overview
[Write a 2–4 sentence summary of the update.]

## What happened
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

## Why it matters
[Explain the impact/importance in 1–2 paragraphs.]

## Current situation
- Location: [State / LGA]
- Date: ${now}
- Status: [Ongoing / Resolved / Monitoring]

## Next steps
1. [Action 1]
2. [Action 2]

## Contact
For enquiries: [email/phone]
`;
  }

  return `## Executive Summary
[Write a short executive summary (5–8 lines).]

## Background / Context
[Explain the context and why this publication matters.]

## Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

## Data & Methodology
[Describe the data sources, timeframe, and method used.]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

## Limitations
[State any limitations of the analysis.]

## References
- [Reference 1]
- [Reference 2]
`;
}

function htmlToReadableText(html = "") {
  // Make a decent “editing fallback” for legacy articles created before contentRaw existed.
  return String(html || "")
    .replace(/<\/(h2|h3|h4)>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/(ul|ol)>/gi, "\n\n")
    .replace(/<[^>]*>/g, "") // strip remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function FormattingGuide() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-700">
      <div className="font-semibold text-gray-900">Formatting guide (no HTML needed)</div>

      <ul className="mt-3 list-disc pl-5 space-y-1">
        <li>
          Headings: <code className="bg-white px-1 rounded">## Heading</code>
        </li>
        <li>
          Bullet list: <code className="bg-white px-1 rounded">- item</code>
        </li>
        <li>
          Numbered list: <code className="bg-white px-1 rounded">1. item</code>
        </li>
        <li>
          Bold: <code className="bg-white px-1 rounded">**bold**</code>
        </li>
        <li>
          Link: <code className="bg-white px-1 rounded">[text](https://example.com)</code>
        </li>
        <li>New paragraph: leave a blank line</li>
      </ul>

      <p className="mt-3 text-xs text-gray-500">
        Note: alignment (center/right) is not supported in this editor. If needed later, we can add a
        professional WYSIWYG editor (TipTap) as Phase 2.
      </p>
    </div>
  );
}

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [busyRemove, setBusyRemove] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const [article, setArticle] = useState(null);

  const [form, setForm] = useState({
    category: "publication",
    title: "",
    subtitle: "",
    excerpt: "",
    authorName: "",
    tags: "",
    content: "", // RAW markdown/plain text
  });

  const [regenerateSlug, setRegenerateSlug] = useState(false);

  // media (new uploads)
  const [cover, setCover] = useState(null);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);

  const previewHtml = useMemo(() => {
    marked.setOptions({ mangle: false, headerIds: false, breaks: true });
    const html = marked.parse(form.content || "");
    return DOMPurify.sanitize(html);
  }, [form.content]);

  const fetchArticle = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/articles/admin/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const a = res.data;
      setArticle(a);

      setForm({
        category: a.category || "publication",
        title: a.title || "",
        subtitle: a.subtitle || "",
        excerpt: a.excerpt || "",
        authorName: a.authorName || "",
        tags: Array.isArray(a.tags) ? a.tags.join(", ") : "",
        // ✅ Prefer contentRaw; fallback to readable text derived from HTML for legacy items
        content: (a.contentRaw && a.contentRaw.trim()) ? a.contentRaw : htmlToReadableText(a.content || ""),
      });

      setRegenerateSlug(false);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const insertTemplate = () => {
    const tpl = buildTemplate(form.category);
    const hasText = (form.content || "").trim().length > 0;
    if (hasText) {
      const ok = window.confirm("Replace the current content with the template?");
      if (!ok) return;
    }
    setForm((p) => ({ ...p, content: tpl }));
  };

  const appendTemplate = () => {
    const tpl = buildTemplate(form.category);
    const current = form.content || "";
    const next = current.trim() ? `${current.trim()}\n\n${tpl}` : tpl;
    setForm((p) => ({ ...p, content: next }));
  };

  const saveText = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/articles/${id}`,
        { ...form, updateSlug: regenerateSlug ? "true" : "false" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert("Saved");
      navigate("/admin/publications");
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveMedia = async () => {
    if (!accessToken) return;

    if (!cover && (!files || files.length === 0) && (!images || images.length === 0)) {
      alert("Choose a cover image, gallery images, and/or attachments first.");
      return;
    }

    const data = new FormData();
    if (cover) data.append("cover", cover);
    for (let i = 0; i < (images?.length || 0); i++) data.append("images", images[i]);
    for (let i = 0; i < (files?.length || 0); i++) data.append("files", files[i]);

    setSavingMedia(true);
    try {
      await axios.put(`${API_URL}/api/articles/${id}/media`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Media updated");
      setCover(null);
      setImages([]);
      setFiles([]);

      await fetchArticle();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to update media");
    } finally {
      setSavingMedia(false);
    }
  };

  const removeMedia = async (kind, url) => {
    if (!accessToken) return;

    const ok =
      kind === "cover"
        ? window.confirm("Remove cover image?")
        : window.confirm("Remove this item?");
    if (!ok) return;

    try {
      setBusyRemove(`${kind}:${url || "cover"}`);

      await axios.delete(`${API_URL}/api/articles/${id}/media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { kind, url },
      });

      await fetchArticle();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to remove");
    } finally {
      setBusyRemove("");
    }
  };

  const current = useMemo(() => {
    return {
      coverImage: article?.coverImage || "",
      images: Array.isArray(article?.images) ? article.images : [],
      attachments: Array.isArray(article?.attachments) ? article.attachments : [],
    };
  }, [article]);

  if (loading) {
    return (
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-gray-600">Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-primary">Edit Content</h1>
        <p className="mt-2 text-gray-600">
          Use headings and lists with simple formatting. No HTML required.
        </p>

        <div className="mt-8">
          <FormattingGuide />
        </div>

        <form onSubmit={saveText} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-md p-4"
            >
              <option value="publication">Publication</option>
              <option value="news">News</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-md p-4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
            <input
              name="subtitle"
              value={form.subtitle}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-md p-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
            <input
              name="excerpt"
              value={form.excerpt}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-md p-4"
              placeholder="Leave blank to auto-generate from content"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Author name</label>
              <input
                name="authorName"
                value={form.authorName}
                onChange={onChange}
                className="w-full border border-gray-200 rounded-md p-4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={onChange}
                placeholder="Flood, Policy, Risk..."
                className="w-full border border-gray-200 rounded-md p-4"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="block text-sm font-semibold text-gray-700">
              Content (Markdown supported)
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertTemplate}
                className="text-xs font-semibold px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
              >
                Insert template
              </button>

              <button
                type="button"
                onClick={appendTemplate}
                className="text-xs font-semibold px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
              >
                Append template
              </button>

              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs font-semibold px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
              >
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
            </div>
          </div>

          <div className={`grid ${showPreview ? "lg:grid-cols-2" : ""} gap-6`}>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-md p-4 min-h-[320px]"
              required
              placeholder="Write here... Use ## for headings, - for bullets."
            />

            {showPreview && (
              <div className="border border-gray-200 rounded-md p-4 bg-white">
                <div className="text-xs font-semibold text-gray-500 mb-3">Preview</div>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-5">
            <input
              id="regenSlug"
              type="checkbox"
              checked={regenerateSlug}
              onChange={(e) => setRegenerateSlug(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="regenSlug" className="text-sm text-gray-700">
              <span className="font-semibold">Regenerate slug from title</span>
              <span className="block text-gray-600 mt-1">
                Only enable if you’re okay changing the URL.
              </span>
            </label>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-gray-200 px-8 py-3 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* CURRENT MEDIA PREVIEW */}
        <div className="mt-12 border-t border-gray-100 pt-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-primary">Current media</h2>
            <p className="mt-2 text-sm text-gray-600">
              These are already uploaded. You can remove them or upload more below.
            </p>
          </div>

          {/* Cover preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="font-semibold text-gray-800">Cover image</div>
              {current.coverImage && (
                <button
                  onClick={() => removeMedia("cover", current.coverImage)}
                  disabled={busyRemove === `cover:${current.coverImage}`}
                  className="text-xs font-semibold px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mt-4">
              {current.coverImage ? (
                <img
                  src={current.coverImage}
                  alt="Cover"
                  className="w-full max-h-72 object-cover rounded-xl border border-gray-100 bg-white"
                />
              ) : (
                <div className="text-sm text-gray-500">No cover image uploaded.</div>
              )}
            </div>
          </div>

          {/* Gallery preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="font-semibold text-gray-800">Gallery images</div>

            {current.images.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">No gallery images.</div>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {current.images.map((u) => (
                  <div key={u} className="relative group">
                    <img
                      src={u}
                      alt="Gallery"
                      className="h-28 w-full object-cover rounded-xl border border-gray-100 bg-white"
                    />
                    <button
                      onClick={() => removeMedia("image", u)}
                      disabled={busyRemove === `image:${u}`}
                      className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-md bg-white/95 border border-gray-200 opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="font-semibold text-gray-800">Attachments</div>

            {current.attachments.length === 0 ? (
              <div className="mt-3 text-sm text-gray-500">No attachments.</div>
            ) : (
              <div className="mt-4 space-y-2">
                {current.attachments.map((u) => (
                  <div
                    key={u}
                    className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3"
                  >
                    <a
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-secondary hover:underline truncate"
                      title={u}
                    >
                      {isPdfUrl(u) ? "Open PDF" : "Open file"}
                    </a>

                    <button
                      onClick={() => removeMedia("attachment", u)}
                      disabled={busyRemove === `attachment:${u}`}
                      className="text-xs font-semibold px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload new media */}
          <div className="border-t border-gray-100 pt-10">
            <h2 className="text-xl font-semibold text-primary">Upload new media</h2>
            <p className="mt-2 text-sm text-gray-600">
              Upload a new cover, add gallery images, or attach PDFs/docs. (These will be appended.)
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New cover image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gallery images (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(e.target.files || [])}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachments (PDF/DOC)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files || [])}
                />
              </div>

              <button
                type="button"
                disabled={savingMedia}
                onClick={saveMedia}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-gray-900 text-white font-semibold hover:bg-black transition disabled:opacity-60"
              >
                {savingMedia ? "Uploading…" : "Upload media"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}