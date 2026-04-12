import { useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
        Note: text alignment (center/right) is not supported in this simple editor. If you need that,
        we can add a professional WYSIWYG editor (TipTap) in Phase 2.
      </p>
    </div>
  );
}

export default function CreateArticle() {
  const { accessToken, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState({
    category: "publication",
    title: "",
    subtitle: "",
    excerpt: "",
    authorName: user?.name || "",
    tags: "",
    content: "", // RAW markdown/plain text
  });

  const [cover, setCover] = useState(null);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onCover = (e) => setCover(e.target.files?.[0] || null);
  const onImages = (e) => setImages(e.target.files || []);
  const onFiles = (e) => setFiles(e.target.files || []);

  const previewHtml = useMemo(() => {
    marked.setOptions({ mangle: false, headerIds: false, breaks: true });
    const html = marked.parse(form.content || "");
    return DOMPurify.sanitize(html);
  }, [form.content]);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) return;

    if (submitting) return;
    setSubmitting(true);

    const data = new FormData();
    Object.keys(form).forEach((k) => data.append(k, form[k]));

    if (cover) data.append("cover", cover);
    for (let i = 0; i < (images?.length || 0); i++) data.append("images", images[i]);
    for (let i = 0; i < (files?.length || 0); i++) data.append("files", files[i]);

    try {
      await axios.post(`${API_URL}/api/articles`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      alert("Created successfully");

      setForm({
        category: "publication",
        title: "",
        subtitle: "",
        excerpt: "",
        authorName: user?.name || "",
        tags: "",
        content: "",
      });
      setCover(null);
      setImages([]);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-primary">Create Content</h1>
        <p className="mt-2 text-gray-600">
          Create a <b>Publication</b> (report with PDF) or <b>News</b> (article update).
        </p>

        <div className="mt-8">
          <FormattingGuide />
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
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

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={onChange}
            className="w-full border border-gray-200 p-4 rounded-md"
            required
          />

          <input
            name="subtitle"
            placeholder="Subtitle (optional)"
            value={form.subtitle}
            onChange={onChange}
            className="w-full border border-gray-200 p-4 rounded-md"
          />

          <input
            name="excerpt"
            placeholder="Excerpt (used on cards). Leave empty to auto-generate."
            value={form.excerpt}
            onChange={onChange}
            className="w-full border border-gray-200 p-4 rounded-md"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="authorName"
              placeholder="Author name (shown publicly)"
              value={form.authorName}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
            />
            <input
              name="tags"
              placeholder="Tags (comma-separated) e.g. Flood, Policy"
              value={form.tags}
              onChange={onChange}
              className="w-full border border-gray-200 p-4 rounded-md"
            />
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Cover image</label>
            <input type="file" accept="image/*" onChange={onCover} />
            <p className="text-xs text-gray-500">Shows in cards and at the top of the article.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Gallery images (optional, up to 5)
            </label>
            <input type="file" accept="image/*" multiple onChange={onImages} />
            <p className="text-xs text-gray-500">
              Add 1–2 images if you want photos inside the article + a gallery below.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Attachments (PDF/DOC)</label>
            <input
              type="file"
              multiple
              onChange={onFiles}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <p className="text-xs text-gray-500">
              For publications, upload the PDF here. Users will open it in a new tab.
            </p>
          </div>

          <button
            disabled={submitting}
            className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-secondary transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </section>
  );
}