const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const url = req.originalUrl || "";

    const isFieldReport = url.includes("/field-reports");
    const isIncident = url.includes("/incidents");
    const isArticle = url.includes("/articles");

    let folder = "disaster-platform/misc";

    if (isFieldReport) folder = "disaster-platform/field-reports";
    else if (isIncident) folder = "disaster-platform/incidents";
    else if (isArticle) {
      if (file.fieldname === "cover") folder = "disaster-platform/articles/covers";
      else if (file.fieldname === "images") folder = "disaster-platform/articles/gallery";
      else folder = "disaster-platform/articles/attachments";
    }

    return {
      folder,
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "pdf",
        "doc",
        "docx",
        "mp4",
        "mov",
        "webm",
        "mkv",
        "avi",
      ],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;