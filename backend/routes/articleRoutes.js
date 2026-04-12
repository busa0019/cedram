const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorizePermissions } = require("../middleware/authMiddleware");
const slugify = require("slugify");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerptFromContent(content, maxLen = 220) {
  const text = stripHtml(content);
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String).map((t) => t.trim()).filter(Boolean);

  if (typeof tags === "string") {
    const s = tags.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String).map((t) => t.trim()).filter(Boolean);
    } catch {}
    return s.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function looksLikeHtml(s = "") {
  return /<[^>]+>/.test(String(s));
}

function sanitizeArticleHtml(html = "") {
  return sanitizeHtml(String(html || ""), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "hr",
      "a",
      "code",
      "pre",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "#";
        return {
          tagName: "a",
          attribs: {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

function normalizeContentToHtml(contentRaw = "") {
  const raw = String(contentRaw || "").trim();
  if (!raw) return "";

  marked.setOptions({
    mangle: false,
    headerIds: false,
    breaks: true,
  });

  let html = "";
  if (looksLikeHtml(raw)) html = raw;
  else html = marked.parse(raw);

  return sanitizeArticleHtml(html);
}

/* ✅ CREATE */
router.post(
  "/",
  protect,
  authorizePermissions("manage_publications"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "files", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const title = (req.body.title || "").trim();
      const subtitle = (req.body.subtitle || "").trim();

      const contentRaw = String(req.body.content || "");
      const content = normalizeContentToHtml(contentRaw);

      if (!title) return res.status(400).json({ message: "Title is required" });
      if (!content.trim()) return res.status(400).json({ message: "Content is required" });

      const category = ["news", "publication"].includes(req.body.category)
        ? req.body.category
        : "publication";

      let slug = slugify(title, { lower: true, strict: true });
      const existing = await Article.findOne({ slug });
      if (existing) slug = `${slug}-${Date.now()}`;

      const files = req.files || {};
      const coverFile = files.cover?.[0];
      const imageFiles = files.images || [];
      const attachmentFiles = files.files || [];

      const excerpt =
        (req.body.excerpt || "").trim() || makeExcerptFromContent(content, 220);

      const article = await Article.create({
        category,
        title,
        subtitle,
        contentRaw,
        content,
        excerpt,
        slug,
        coverImage: coverFile?.path || "",
        images: imageFiles.map((f) => f.path),
        authorName: (req.body.authorName || req.user?.name || "").trim(),
        tags: parseTags(req.body.tags),
        attachments: attachmentFiles.map((f) => f.path),
        created_by: req.user._id,
        isPublished: false,
        publishDate: null,
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ ADMIN: list all */
router.get(
  "/admin",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      const articles = await Article.find()
        .sort({ createdAt: -1 })
        .populate("created_by", "name email");
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ ADMIN: get one (drafts allowed) */
router.get(
  "/admin/:id",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id).populate(
        "created_by",
        "name email"
      );
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ UPDATE (text/meta only) */
router.put(
  "/:id",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      if (typeof req.body.content === "string") {
        const contentRaw = req.body.content;
        const content = normalizeContentToHtml(contentRaw);

        req.body.contentRaw = contentRaw;
        req.body.content = content;

        req.body.excerpt =
          (req.body.excerpt || "").trim() || makeExcerptFromContent(content, 220);
      }

      if (req.body.tags !== undefined) req.body.tags = parseTags(req.body.tags);

      if (req.body.category) {
        req.body.category = ["news", "publication"].includes(req.body.category)
          ? req.body.category
          : "publication";
      }

      if (
        req.body.updateSlug === "true" &&
        typeof req.body.title === "string" &&
        req.body.title.trim()
      ) {
        let newSlug = slugify(req.body.title, { lower: true, strict: true });
        const clash = await Article.findOne({
          slug: newSlug,
          _id: { $ne: req.params.id },
        });
        if (clash) newSlug = `${newSlug}-${Date.now()}`;
        req.body.slug = newSlug;
      }

      delete req.body.updateSlug;

      const updated = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) return res.status(404).json({ message: "Article not found" });
      res.json(updated);
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ UPDATE MEDIA (cover + gallery images + attachments) */
router.put(
  "/:id/media",
  protect,
  authorizePermissions("manage_publications"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "files", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      const files = req.files || {};
      const coverFile = files.cover?.[0];
      const imageFiles = files.images || [];
      const attachmentFiles = files.files || [];

      if (coverFile) article.coverImage = coverFile.path;

      if (imageFiles.length > 0) {
        article.images = [...(article.images || []), ...imageFiles.map((f) => f.path)];
      }

      if (attachmentFiles.length > 0) {
        article.attachments = [
          ...(article.attachments || []),
          ...attachmentFiles.map((f) => f.path),
        ];
      }

      await article.save();
      res.json(article);
    } catch (error) {
      console.error("Update media error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ REMOVE ONE MEDIA ITEM (attachment or image or cover) */
router.delete(
  "/:id/media",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      const { kind, url } = req.body || {};
      if (!kind) return res.status(400).json({ message: "kind is required" });

      if (kind !== "cover" && !url) {
        return res.status(400).json({ message: "url is required for this kind" });
      }

      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      if (kind === "attachment") {
        article.attachments = (article.attachments || []).filter((u) => u !== url);
      } else if (kind === "image") {
        article.images = (article.images || []).filter((u) => u !== url);
      } else if (kind === "cover") {
        article.coverImage = "";
      } else {
        return res.status(400).json({ message: "Invalid kind" });
      }

      await article.save();
      res.json(article);
    } catch (error) {
      console.error("Remove media error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ DELETE */
router.delete(
  "/:id",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      const deleted = await Article.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Article not found" });
      res.json({ message: "Article deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ TOGGLE PUBLISH */
router.put(
  "/:id/publish",
  protect,
  authorizePermissions("manage_publications"),
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).json({ message: "Article not found" });

      article.isPublished = !article.isPublished;
      article.publishDate = article.isPublished ? new Date() : null;

      await article.save();
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ✅ PUBLIC LIST WITH PAGINATION + SEARCH */
router.get("/", async (req, res) => {
  try {
    const { category, limit, page, search } = req.query;
    const query = { isPublished: true };

    if (category && ["news", "publication"].includes(category)) {
      query.category = category;
    }

    if (search && String(search).trim()) {
      const s = String(search).trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { subtitle: { $regex: s, $options: "i" } },
        { excerpt: { $regex: s, $options: "i" } },
        { authorName: { $regex: s, $options: "i" } },
        { tags: { $regex: s, $options: "i" } },
      ];
    }

    let lim = parseInt(limit, 10);
    if (!Number.isFinite(lim) || lim <= 0) lim = 12;
    lim = Math.min(lim, 50);

    let pg = parseInt(page, 10);
    if (!Number.isFinite(pg) || pg <= 0) pg = 1;

    const skip = (pg - 1) * lim;

    const [total, items] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .select(
          "category title subtitle excerpt slug attachments publishDate createdAt coverImage authorName tags images"
        ),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / lim));

    res.json({
      items,
      total,
      page: pg,
      limit: lim,
      totalPages,
      hasNextPage: pg < totalPages,
      hasPrevPage: pg > 1,
    });
  } catch (error) {
    console.error("Public article list error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ✅ PUBLIC SINGLE BY SLUG */
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, isPublished: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ PUBLIC SINGLE BY ID */
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id, isPublished: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;