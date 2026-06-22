import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../cloudinary/conections.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // decide folder based on file type
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    return {
      folder: isImage ? "chat/images" : isVideo ? "chat/videos" : "chat/files",
      resource_type: isVideo ? "video" : "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "pdf"],
      transformation: isImage
        ? [{ width: 700, height: 600, crop: "limit" }]
        : undefined,
    };
  },
});

// file size limits
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// file type filter
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

export const upload = multer({ storage, limits, fileFilter });
