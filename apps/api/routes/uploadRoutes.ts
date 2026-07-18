import express from "express";
import asyncHandler from "express-async-handler";
import uploadService from "../config/uploadService.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  cleanupOrphanedImages,
  bulkDeleteImages,
} from "../controllers/imageCleanupController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// @desc    Upload image with folder support
// @route   POST /api/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  let image = req.body.image;
  const folder = req.body.folder;

  // Handle multipart/form-data upload via multer
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    image = `data:${req.file.mimetype};base64,${b64}`;
  }

  if (!image) {
    res.status(400);
    throw new Error("Image data is required");
  }

  try {
    const result = await uploadService.uploadImage(image, {
      folder: folder,
      originalName: req.body.originalName || "upload.jpg",
    });

    res.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      provider: result.provider,
    });
  } catch (error) {
    res.status(500);
    throw new Error(
      `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

// @desc    Test upload service
// @route   POST /api/upload/test
// @access  Private/Admin
const testUpload = asyncHandler(async (req, res) => {
  const { image, provider, folder, originalName } = req.body;

  if (!image) {
    res.status(400);
    throw new Error("Image data is required");
  }

  try {
    const result = await uploadService.uploadImage(image, {
      provider: provider || undefined, // Will use default if not specified
      folder: folder || "test",
      originalName: originalName || "test_image.jpg",
    });

    res.json({
      success: true,
      result,
      stats: uploadService.getUploadStats(),
    });
  } catch (error) {
    res.status(500);
    throw new Error(
      `Upload test failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

// @desc    Get upload service stats
// @route   GET /api/upload/stats
// @access  Private/Admin
const getUploadStats = asyncHandler(async (req, res) => {
  const stats = uploadService.getUploadStats();
  res.json({
    success: true,
    stats,
  });
});

// @desc    Delete an uploaded image
// @route   DELETE /api/upload/delete
// @access  Private/Admin
const deleteUpload = asyncHandler(async (req, res) => {
  const { identifier, provider } = req.body;

  if (!identifier) {
    res.status(400);
    throw new Error("Image identifier (URL, key, or public ID) is required");
  }

  try {
    const result = await uploadService.deleteImage(identifier, provider);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500);
    throw new Error(
      `Delete failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

// @desc    Generate presigned URL for S3 upload
// @route   POST /api/upload/presigned-url
// @access  Private/Admin
const generatePresignedUrl = asyncHandler(async (req, res) => {
  const { key, expiresIn } = req.body;

  if (!key) {
    res.status(400);
    throw new Error("S3 object key is required");
  }

  try {
    const signedUrl = await uploadService.generatePresignedUrl(key, expiresIn);
    res.json({
      success: true,
      signedUrl,
      expiresIn: expiresIn || 3600,
    });
  } catch (error) {
    res.status(500);
    throw new Error(
      `Presigned URL generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
});

// Routes
router.post("/", protect, upload.single("image"), uploadImage);
router.post("/test", protect, admin, testUpload);
router.get("/stats", protect, admin, getUploadStats);
router.delete("/delete", protect, admin, deleteUpload);
router.post("/presigned-url", protect, admin, generatePresignedUrl);
router.post("/cleanup", protect, admin, cleanupOrphanedImages);
router.delete("/bulk-delete", protect, admin, bulkDeleteImages);

export default router;
