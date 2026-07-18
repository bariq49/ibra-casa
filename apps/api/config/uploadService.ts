import cloudinary from "./cloudinary.js";
import s3Client, { S3_CONFIG } from "./aws-s3.js";
import imagekit from "./imagekit.js";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { IUploadOptions, IUploadResult } from "../types/index.js";

const ROOT_FOLDER = "sellzy";

class UploadService {
  private defaultProvider: string;

  constructor() {
    this.defaultProvider = process.env.DEFAULT_UPLOAD_PROVIDER || "imagekit"; // 'imagekit', 'cloudinary' or 's3'
  }

  // Helper to format folder path
  private getFolderPath(folder?: string): string {
    if (!folder) return ROOT_FOLDER;

    // Remove leading/trailing slashes for cleaner path joining
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "");

    if (cleanFolder.startsWith(ROOT_FOLDER)) {
      return cleanFolder;
    }

    return `${ROOT_FOLDER}/${cleanFolder}`;
  }

  // Helper to sanitize item names for dynamic folder paths
  sanitizeFolderName(name: string): string {
    if (!name) return "unnamed";
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Generate unique filename
  generateUniqueFilename(originalName: string, folder: string = ""): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(6).toString("hex");
    const extension = originalName.split(".").pop();
    const baseName = originalName.split(".").slice(0, -1).join(".");
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");

    const filename = `${safeName}_${timestamp}_${randomString}.${extension}`;
    const finalFolder = this.getFolderPath(folder);

    return `${finalFolder}/${filename}`;
  }

  // Upload to ImageKit
  async uploadToImageKit(
    imageData: string | Buffer,
    options: IUploadOptions = {},
  ): Promise<IUploadResult> {
    try {
      const folder = this.getFolderPath(options.folder);
      const filename = options.originalName || "image";

      let fileToUpload: string | Buffer;
      if (Buffer.isBuffer(imageData)) {
        fileToUpload = imageData;
      } else if (
        typeof imageData === "string" &&
        imageData.startsWith("data:")
      ) {
        fileToUpload = imageData;
      } else {
        fileToUpload = imageData;
      }

      const result = await imagekit.upload({
        file: fileToUpload,
        fileName: filename,
        folder: folder,
        useUniqueFileName: true,
      });

      return {
        success: true,
        provider: "imagekit",
        url: result.url,
        fileId: result.fileId,
        publicId: result.fileId, // maintaining backward compatibility
        originalName: options.originalName,
        size: result.size,
        format: result.url.split(".").pop() || "",
      };
    } catch (error: any) {
      throw new Error(`ImageKit upload failed: ${error.message}`);
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(
    imageData: string,
    options: IUploadOptions = {},
  ): Promise<IUploadResult> {
    try {
      const folder = this.getFolderPath(options.folder);

      const result = await cloudinary.uploader.upload(imageData, {
        transformation: options.transformation || [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
        ...options,
        folder: folder,
      });

      return {
        success: true,
        provider: "cloudinary",
        url: result.secure_url,
        publicId: result.public_id,
        originalName: options.originalName,
        size: result.bytes,
        format: result.format,
      };
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Upload to AWS S3
  async uploadToS3(
    imageBuffer: Buffer,
    options: IUploadOptions = {},
  ): Promise<IUploadResult> {
    try {
      const filename = this.generateUniqueFilename(
        options.originalName || "image.jpg",
        options.folder,
      );

      const uploadParams: PutObjectCommandInput = {
        Bucket: S3_CONFIG.bucketName,
        Key: filename,
        Body: imageBuffer,
        ContentType: options.contentType || "image/jpeg",
        // Removed ACL as bucket doesn't allow ACLs
        // Public access will be handled by bucket policy
        Metadata: {
          "original-name": options.originalName || "",
          "upload-date": new Date().toISOString(),
        },
      };

      const command = new PutObjectCommand(uploadParams);
      await S3_CONFIG.client.send(command);

      const url = `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${filename}`;

      return {
        success: true,
        provider: "s3",
        url: url,
        key: filename,
        originalName: options.originalName,
        size: imageBuffer.length,
        bucket: S3_CONFIG.bucketName,
      };
    } catch (error: any) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  // Main upload method - uses default provider or specified provider
  async uploadImage(
    imageData: string | Buffer,
    options: IUploadOptions = {},
  ): Promise<IUploadResult> {
    const provider = options.provider || this.defaultProvider;

    try {
      if (provider === "s3") {
        // Convert base64 to buffer if needed
        let imageBuffer: Buffer;
        if (typeof imageData === "string" && imageData.startsWith("data:")) {
          // Base64 data URL
          const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
          imageBuffer = Buffer.from(base64Data, "base64");

          // Extract content type
          const contentTypeMatch = imageData.match(/^data:([^;]+);/);
          if (contentTypeMatch) {
            options.contentType = contentTypeMatch[1];
          }
        } else if (Buffer.isBuffer(imageData)) {
          imageBuffer = imageData;
        } else {
          throw new Error("Invalid image data format for S3 upload");
        }

        return await this.uploadToS3(imageBuffer, options);
      } else if (provider === "imagekit") {
        return await this.uploadToImageKit(imageData, options);
      } else {
        // Cloudinary expects string or buffer, but usually string path or base64
        return await this.uploadToCloudinary(imageData as string, options);
      }
    } catch (error: any) {
      console.error(`Upload failed with ${provider}:`, error.message);

      // Fallback to alternative provider if primary fails
      if (options.enableFallback !== false) {
        const fallbackProvider = provider === "s3" ? "cloudinary" : "s3";

        try {
          return await this.uploadImage(imageData, {
            ...options,
            provider: fallbackProvider,
            enableFallback: false, // Prevent infinite fallback loop
          });
        } catch (fallbackError: any) {
          throw new Error(
            `Both upload providers failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`,
          );
        }
      }

      throw error;
    }
  }

  // Replace image - uploads new image and deletes the old one
  async replaceImage(
    newImageData: string | Buffer,
    oldImageUrl: string,
    options: IUploadOptions = {},
  ): Promise<IUploadResult> {
    try {
      // Upload new image first
      const uploadResult = await this.uploadImage(newImageData, options);

      // If upload successful, delete old image
      if (oldImageUrl && uploadResult.success) {
        try {
          await this.deleteImage(oldImageUrl);
        } catch (deleteError: any) {
          console.error(
            `Failed to delete old image ${oldImageUrl}: ${deleteError.message}`,
          );
          // Don't fail the operation if old image deletion fails
        }
      }

      return uploadResult;
    } catch (error: any) {
      throw new Error(`Image replacement failed: ${error.message}`);
    }
  }

  // Delete from Cloudinary
  async deleteFromCloudinary(publicId: string): Promise<IUploadResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === "ok", provider: "cloudinary" };
    } catch (error: any) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  // Delete from S3
  async deleteFromS3(key: string): Promise<IUploadResult> {
    try {
      const deleteParams = {
        Bucket: S3_CONFIG.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await S3_CONFIG.client.send(command);

      return { success: true, provider: "s3" };
    } catch (error: any) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  // Delete from ImageKit
  async deleteFromImageKit(identifier: string): Promise<IUploadResult> {
    try {
      let fileId = identifier;

      // Check if identifier is an ImageKit URL
      if (identifier.includes("ik.imagekit.io")) {
        // Extract filename from URL (remove query params)
        const filename = identifier.split("/").pop()?.split("?")[0];
        if (filename) {
          // Search for the file by name
          const files = await imagekit.listFiles({
            searchQuery: `name="${filename}"`,
          });

          if (files && files.length > 0) {
            // If multiple files have the same name, try to match the path.
            const urlObj = new URL(identifier);
            const pathSegments = urlObj.pathname.split("/");
            // Skip the first empty string and the ImageKit ID
            const pathParts = pathSegments.slice(2);
            const expectedPath = "/" + pathParts.join("/");

            const matchedFile =
              files.find((f) => (f as any).filePath === expectedPath) ||
              files[0];
            fileId = (matchedFile as any).fileId;
          } else {
            console.warn(
              `Could not resolve ImageKit fileId for URL: ${identifier}`,
            );
            return { success: false, provider: "imagekit" };
          }
        }
      }

      await imagekit.deleteFile(fileId);
      return { success: true, provider: "imagekit" };
    } catch (error: any) {
      throw new Error(`ImageKit delete failed: ${error.message}`);
    }
  }

  // Delete image (auto-detects provider based on URL or provides key/publicId)
  async deleteImage(
    identifier: string,
    provider: "imagekit" | "cloudinary" | "s3" | null = null,
  ): Promise<IUploadResult> {
    try {
      if (!provider) {
        // Auto-detect provider based on URL pattern
        if (typeof identifier === "string") {
          if (identifier.includes("ik.imagekit.io")) {
            provider = "imagekit";
            // Check if identifier is full URL or fileId. Deleting via ImageKit needs fileId.
            // If we receive a url instead we try to extract if possible but normally identifier here is publicId
            // Assuming identifier passed is fileId based on how controllers are architectured.
            const urlMatches = identifier.match(
              /ik\.imagekit\.io\/[^/]+\/(.+)$/,
            );
            // If it matches it means a URL was passed, otherwise assume it's fileId
            if (urlMatches) {
              console.warn(
                "ImageKit delete requires fileId, but URL was passed. Deletion might fail if fileId can't be resolved.",
              );
            }
          } else if (identifier.includes("cloudinary.com")) {
            provider = "cloudinary";
            // Extract public ID from Cloudinary URL
            const matches = identifier.match(/\/v\d+\/(.+)\.[^.]+$/);
            identifier = matches ? matches[1] : identifier;
          } else if (
            identifier.includes("amazonaws.com") ||
            identifier.includes("s3.")
          ) {
            provider = "s3";
            // Extract key from S3 URL
            const matches =
              identifier.match(/amazonaws\.com\/(.+)$/) ||
              identifier.match(/s3\.[^/]+\/[^/]+\/(.+)$/);
            identifier = matches ? matches[1] : identifier;
          }
        }
      }

      if (provider === "s3") {
        return await this.deleteFromS3(identifier);
      } else if (provider === "imagekit") {
        return await this.deleteFromImageKit(identifier);
      } else {
        return await this.deleteFromCloudinary(identifier);
      }
    } catch (error: any) {
      console.error("Delete failed:", error.message);
      throw error;
    }
  }

  // Generate presigned URL for S3 (for temporary access)
  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(S3_CONFIG.client, command, {
        expiresIn: expiresIn, // URL expires in 1 hour by default
      });

      return signedUrl;
    } catch (error: any) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  // Get upload statistics
  getUploadStats() {
    return {
      defaultProvider: this.defaultProvider,
      availableProviders: ["imagekit", "cloudinary", "s3"],
      s3Config: {
        region: S3_CONFIG.region,
        bucket: S3_CONFIG.bucketName,
      },
    };
  }
}

// Export singleton instance
const uploadService = new UploadService();
export default uploadService;

// Export convenience methods for backward compatibility
export const uploadToCloudinary = (imageData: string, folder: string) =>
  uploadService.uploadToCloudinary(imageData, { folder });

export const deleteFromCloudinary = (identifier: string) =>
  uploadService.deleteImage(identifier, "cloudinary");
