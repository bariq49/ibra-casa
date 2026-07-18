import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import Blog from "../models/blogModel.js";
import { Request } from "express";

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get comments for a specific blog post
// @route   GET /api/comments/blog/:blogId
// @access  Public
const getCommentsByBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const comments = await Comment.find({ blog: blogId, isActive: true })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 });

  res.json(comments);
});

// @desc    Get all comments (Admin)
// @route   GET /api/comments/admin
// @access  Private (Admin)
const getCommentsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({})
    .populate("user", "name email avatar")
    .populate("blog", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({});

  res.json({
    comments,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = asyncHandler(async (req: AuthRequest, res) => {
  const { blogId, content } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const comment = await Comment.create({
    blog: blogId,
    user: req.user._id,
    content,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "name email avatar",
  );

  res.status(201).json(populatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (User who created it or Admin)
const deleteComment = asyncHandler(async (req: AuthRequest, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Check if user is admin OR user is the owner of the comment
  if (
    req.user.role === "admin" ||
    comment.user.toString() === req.user._id.toString()
  ) {
    await comment.deleteOne();
    res.json({ message: "Comment removed" });
  } else {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }
});

export { getCommentsByBlog, getCommentsAdmin, createComment, deleteComment };
