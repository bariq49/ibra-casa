import asyncHandler from "express-async-handler";
import BlogAuthor from "../models/blogAuthorModel.js";
import uploadService from "../config/uploadService.js";

// @desc    Get all blog authors
// @route   GET /api/blog-authors
// @access  Public
const getBlogAuthors = asyncHandler(async (req, res) => {
  const authors = await BlogAuthor.find({ isActive: true });
  res.json(authors);
});

// @desc    Get all blog authors for admin
// @route   GET /api/blog-authors/admin
// @access  Private (Admin)
const getBlogAuthorsAdmin = asyncHandler(async (req, res) => {
  const authors = await BlogAuthor.find({}).sort({ createdAt: -1 });
  res.json(authors);
});

// @desc    Get blog author by ID
// @route   GET /api/blog-authors/:id
// @access  Public
const getBlogAuthorById = asyncHandler(async (req, res) => {
  const author = await BlogAuthor.findById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc    Create a blog author
// @route   POST /api/blog-authors
// @access  Private/Admin
const createBlogAuthor = asyncHandler(async (req, res) => {
  const { name, role, bio, socialLinks, isActive } = req.body;
  const image = req.body.image as string; // Base64 string

  const authorExists = await BlogAuthor.findOne({ name });
  if (authorExists) {
    res.status(400);
    throw new Error("Author already exists");
  }

  let imageUrl = "";
  if (image) {
    const result = await uploadService.uploadImage(image, {
      folder: "blog-authors",
      originalName: `author_${name.replace(/\s+/g, "_").toLowerCase()}.jpg`,
    });
    imageUrl = result.url as string;
  }

  const author = await BlogAuthor.create({
    name,
    image: imageUrl,
    role,
    bio,
    socialLinks,
    isActive: isActive === undefined ? true : isActive,
  });

  if (author) {
    res.status(201).json(author);
  } else {
    res.status(400);
    throw new Error("Invalid author data");
  }
});

// @desc    Update a blog author
// @route   PUT /api/blog-authors/:id
// @access  Private/Admin
const updateBlogAuthor = asyncHandler(async (req, res) => {
  const { name, role, bio, socialLinks, isActive } = req.body;
  const image = req.body.image as string | undefined;

  const author = await BlogAuthor.findById(req.params.id);

  if (author) {
    author.name = name || author.name;
    author.role = role || author.role;
    author.bio = bio || author.bio;
    author.socialLinks = socialLinks || author.socialLinks;
    if (isActive !== undefined) author.isActive = isActive;

    if (image !== undefined) {
      if (image && image !== author.image) {
        // If new image provided
        const result = await uploadService.replaceImage(image, author.image, {
          folder: "blog-authors",
          originalName: `author_${(name || author.name)
            .replace(/\s+/g, "_")
            .toLowerCase()}.jpg`,
        });
        author.image = result.url as string;
      }
    }

    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

// @desc    Delete a blog author
// @route   DELETE /api/blog-authors/:id
// @access  Private/Admin
const deleteBlogAuthor = asyncHandler(async (req, res) => {
  const author = await BlogAuthor.findById(req.params.id);

  if (author) {
    if (author.image) {
      try {
        await uploadService.deleteImage(author.image);
      } catch (error: any) {
        console.error(
          `Failed to delete author image: ${(error as any).message}`,
        );
      }
    }

    await author.deleteOne();
    res.json({ message: "Author removed" });
  } else {
    res.status(404);
    throw new Error("Author not found");
  }
});

export {
  getBlogAuthors,
  getBlogAuthorsAdmin,
  getBlogAuthorById,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
};
