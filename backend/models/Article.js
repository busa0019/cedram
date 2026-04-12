const mongoose = require("mongoose");

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

const articleSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["publication", "news"],
      default: "publication",
      index: true,
    },

    title: { type: String, required: true },
    subtitle: String,

    // ✅ what admin typed (Markdown/plain text). Used for editing in admin.
    contentRaw: { type: String, default: "" },

    // ✅ HTML generated from contentRaw (public rendering)
    content: { type: String, required: true },

    excerpt: { type: String, default: "" },

    slug: { type: String, required: true, unique: true, index: true },

    coverImage: { type: String, default: "" },

    images: [{ type: String }],

    authorName: { type: String, default: "" },
    tags: [{ type: String }],

    attachments: [{ type: String }],

    isPublished: { type: Boolean, default: false },
    publishDate: { type: Date },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

articleSchema.pre("validate", function () {
  if (this.isModified("content") || !this.excerpt) {
    this.excerpt = makeExcerptFromContent(this.content, 220);
  }
});

module.exports = mongoose.model("Article", articleSchema);