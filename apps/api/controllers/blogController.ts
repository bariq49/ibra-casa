import asyncHandler from "express-async-handler";
import Blog from "../models/blogModel.js";
import uploadService from "../config/uploadService.js";
import ProductBase from "../models/productBaseModel.js";
import BlogCategory from "../models/blogCategoryModel.js";

// @desc    Get all blogs (public)
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const categorySlug = req.query.category as string;
  const productBaseSlug = req.query.productBase as string;
  const tag = req.query.tag;
  const search = req.query.search;

  const query: any = { isPublished: true };

  if (categorySlug) {
    const categoryDoc = await BlogCategory.findOne({ slug: categorySlug });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      res.json({ blogs: [], page, pages: 0, total: 0 });
      return;
    }
  }

  if (productBaseSlug) {
    const pBase = await ProductBase.findOne({ slug: productBaseSlug });
    if (pBase) {
      query.productBases = pBase._id;
    } else {
      res.json({ blogs: [], page, pages: 0, total: 0 });
      return;
    }
  }

  if (tag) {
    query.tags = tag;
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const blogs = await Blog.find(query)
    .populate("author", "name image slug")
    .populate("category", "name slug")
    .populate("productBases", "title slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.json({
    blogs,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    isPublished: true,
  })
    .populate("author", "name image bio socialLinks")
    .populate("category", "name slug");

  if (blog) {
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save({ validateBeforeSave: false });
    res.json(blog);
  } else {
    res.status(404);
    throw new Error("Blog post not found");
  }
});

// @desc    Get all blogs for admin
// @route   GET /api/blogs/admin
// @access  Private (Admin)
const getBlogsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sortOrder = req.query.sortOrder || "desc";
  const search = req.query.search;

  const query: any = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const blogs = await Blog.find(query)
    .populate("author", "name")
    .populate("category", "name")
    .populate("productBases", "title")
    .sort({ createdAt: sortValue })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.json({
    blogs,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    excerpt,
    author,
    category,
    tags,
    productBases,
    isFeatured,
    isPublished,
    readTime,
  } = req.body;
  const { previewImage, bannerImage } = req.body as {
    previewImage: string;
    bannerImage?: string;
  }; // Base64 strings

  let previewImageUrl = "";
  let bannerImageUrl = "";

  // Upload Preview Image
  if (previewImage) {
    const folderName = `blogs/previews/${uploadService.sanitizeFolderName(title)}`;
    const result = await uploadService.uploadImage(previewImage, {
      folder: folderName,
      originalName: `preview_${title.substring(0, 10).replace(/\s+/g, "_")}.jpg`,
    });
    previewImageUrl = result.url as string;
  }

  // Upload Banner Image
  if (bannerImage) {
    const folderName = `blogs/banners/${uploadService.sanitizeFolderName(title)}`;
    const result = await uploadService.uploadImage(bannerImage, {
      folder: folderName,
      originalName: `banner_${title.substring(0, 10).replace(/\s+/g, "_")}.jpg`,
    });
    bannerImageUrl = result.url as string;
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    author,
    category,
    tags: tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(",").map((t: string) => t.trim())
      : [],
    productBases: productBases
      ? Array.isArray(productBases)
        ? productBases
        : productBases.split(",").map((pb: string) => pb.trim())
      : [],
    isFeatured: isFeatured || false,
    isPublished: isPublished || false,
    publishedAt: isPublished ? new Date() : undefined,
    readTime,
    previewImage: previewImageUrl,
    bannerImage: bannerImageUrl,
  });

  if (blog) {
    res.status(201).json(blog);
  } else {
    // If creation fails but images uploaded, cleanup might be needed (optional optimization)
    res.status(400);
    throw new Error("Invalid blog data");
  }
});

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      productBases,
      isFeatured,
      isPublished,
      readTime,
    } = req.body;
    const { previewImage, bannerImage } = req.body as {
      previewImage?: string;
      bannerImage?: string;
    };

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.author = author || blog.author;
    blog.category = category || blog.category;
    blog.category = category || blog.category;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t: string) => t.trim());
    }
    if (productBases !== undefined) {
      blog.productBases = Array.isArray(productBases)
        ? productBases
        : productBases.split(",").map((pb: string) => pb.trim());
    }
    if (isFeatured !== undefined) {
      blog.isFeatured = isFeatured;
    }
    blog.readTime = readTime || blog.readTime;

    // Handle Publish Status
    if (isPublished !== undefined) {
      if (isPublished && !blog.isPublished) {
        blog.publishedAt = new Date();
      }
      blog.isPublished = isPublished;
    }

    // Handle Preview Image Update
    if (previewImage !== undefined) {
      if (previewImage && previewImage !== blog.previewImage) {
        const blogTitle = title || blog.title || "";
        const folderName = `blogs/previews/${uploadService.sanitizeFolderName(blogTitle)}`;
        const result = await uploadService.replaceImage(
          previewImage,
          blog.previewImage || "",
          {
            folder: folderName,
            originalName: `preview_${blogTitle.substring(0, 10)}.jpg`,
          },
        );

        blog.previewImage = result.url as string;
      }
    }

    // Handle Banner Image Update
    if (bannerImage !== undefined) {
      if (bannerImage && bannerImage !== blog.bannerImage) {
        const blogTitle = title || blog.title || "";
        const folderName = `blogs/banners/${uploadService.sanitizeFolderName(blogTitle)}`;
        const result = await uploadService.replaceImage(
          bannerImage as string,
          blog.bannerImage || "",
          {
            folder: folderName,
            originalName: `banner_${blogTitle.substring(0, 10)}.jpg`,
          },
        );

        blog.bannerImage = result.url as string;
      } else if (bannerImage === "") {
        // If user wants to remove banner
        if (blog.bannerImage) {
          await uploadService
            .deleteImage(blog.bannerImage!)
            .catch(console.error);
        }
        blog.bannerImage = undefined;
      }
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    if (blog.previewImage) {
      await uploadService.deleteImage(blog.previewImage).catch(console.error);
    }
    if (blog.bannerImage) {
      await uploadService.deleteImage(blog.bannerImage).catch(console.error);
    }
    // Note: Content images (embedded in rich text) are harder to track and delete.
    // They might remain as orphaned images. Usually handled by a cleanup cron job.

    await blog.deleteOne();
    res.json({ message: "Blog removed" });
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});

export {
  getBlogs,
  getBlogsAdmin,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
