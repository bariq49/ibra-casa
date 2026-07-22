"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FullProduct } from "@/hooks/useProductBySlug";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import Ratings from "../common/products/Ratings";
import { Button } from "@/components/ui/button";

// Optional: format date
// import { formatDistanceToNow } from "date-fns";

export default function ProductReviews({ product }: { product: FullProduct }) {
  const { user } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(true);

  // Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  // Interaction States
  const [replyMode, setReplyMode] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actorId, setActorId] = useState("");
  const isLoggedIn = Boolean(user?._id);

  // Only non-pending reviews are shown on the product page
  const [localReviews, setLocalReviews] = useState<any[]>(
    (product.reviews || []).filter((r) => r.isApproved !== false),
  );

  // Derive rating distribution
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const reviews = localReviews;
  reviews.forEach((review) => {
    const r = Math.round(review.rating);
    if (r >= 1 && r <= 5) {
      ratingDistribution[r as keyof typeof ratingDistribution]++;
    }
  });

  const handleWriteReviewClick = () => {
    setShowReviewForm(!showReviewForm);
    if (!showReviewForm) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setIsAnonymous(false);
    }
  };

  const handleAnonymousToggle = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      setName("");
      setEmail("");
    } else {
      setName(user?.name || "");
      setEmail(user?.email || "");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    if (!isAnonymous && (!name.trim() || !email.trim())) {
      toast.error("Please provide your name and email");
      return;
    }
    const payloadData = isAnonymous
      ? { rating, comment, isAnonymous: true }
      : { rating, comment, name: name.trim(), email: email.trim() };
    setIsSubmitting(true);
    try {
      const res = await api.post(
        API_ENDPOINTS.PRODUCTS.REVIEW(product._id as string),
        payloadData,
      );
      // Never show pending reviews on the product page — wait for admin approval
      if (res.data?.review && res.data.review.isApproved !== false) {
        setLocalReviews((prev) => [...prev, res.data.review]);
      }
      setShowReviewForm(false);
      setComment("");
      setRating(5);
      setName(user?.name || "");
      setEmail(user?.email || "");
      setIsAnonymous(false);
      toast.success(
        res.data?.message ||
          "Review submitted. It will appear after admin approval.",
      );
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActorId = () => {
    if (user?._id) return String(user._id);
    if (typeof window === "undefined") return "";
    const key = "sellzy_guest_id";
    let guestId = localStorage.getItem(key);
    if (!guestId) {
      guestId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, guestId);
    }
    return guestId;
  };

  useEffect(() => {
    setActorId(getActorId());
  }, [user?._id]);

  const hasReacted = (list: any[] | undefined) =>
    !!actorId &&
    (list || []).some((id) => String(id) === actorId);

  const handleReviewLike = async (reviewId: string) => {
    setActionLoading(`like-${reviewId}`);
    try {
      const res = await api.post(
        API_ENDPOINTS.PRODUCTS.LIKE_REVIEW(product._id as string, reviewId),
        { guestId: getActorId() },
      );
      if (res.data?.review) {
        setLocalReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? res.data.review : r)),
        );
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to like the review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewDislike = async (reviewId: string) => {
    setActionLoading(`dislike-${reviewId}`);
    try {
      const res = await api.post(
        API_ENDPOINTS.PRODUCTS.DISLIKE_REVIEW(product._id as string, reviewId),
        { guestId: getActorId() },
      );
      if (res.data?.review) {
        setLocalReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? res.data.review : r)),
        );
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to dislike the review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    if (!isLoggedIn) {
      if (!replyName.trim() || !replyEmail.trim()) {
        toast.error("Please provide your name and email to reply");
        return;
      }
    }
    setIsReplying(true);
    try {
      const payload = isLoggedIn
        ? { comment: replyText.trim() }
        : {
            comment: replyText.trim(),
            name: replyName.trim(),
            email: replyEmail.trim(),
          };
      const res = await api.post(
        API_ENDPOINTS.PRODUCTS.REPLY_REVIEW(product._id as string, reviewId),
        payload,
      );
      if (res.data?.review) {
        // API already strips pending replies for guests
        setLocalReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? res.data.review : r)),
        );
      }
      setReplyMode(null);
      setReplyText("");
      setReplyName("");
      setReplyEmail("");
      toast.success(
        res.data?.message ||
          (isLoggedIn
            ? "Reply posted!"
            : "Reply submitted. It will appear after admin approval."),
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to post reply");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="py-12">
      <div className="w-full border border-border rounded-[24px] overflow-hidden bg-white">
        {/* Title bar */}
        <div className="bg-[#f4f6f8] px-6 py-4 border-b border-border">
          <h2 className="font-Urbanist font-bold text-[20px] text-foreground leading-[30px]">
            Customer Reviews
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border bg-white border-b border-border">
          {/* Left: Overall Rating */}
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <p className="font-semibold text-foreground">Average rating</p>
            <h2 className="text-5xl font-bold text-destructive">
              {product.averageRating?.toFixed(1) || "0.0"}/5
            </h2>
            <div className="flex items-center gap-1">
              <Ratings
                rating={product.averageRating || 0}
                totalReviews={product.numReviews || 0}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              ({product.numReviews || 0} reviews)
            </p>
          </div>

          {/* Middle: Rating Distribution */}
          <div className="p-8 space-y-3 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                ratingDistribution[star as keyof typeof ratingDistribution];
              const percentage =
                product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-x-3 text-sm">
                  <span className="font-semibold text-foreground w-12 shrink-0">
                    {star} Star
                  </span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-primary-light"
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right shrink-0">
                    {count > 1000 ? (count / 1000).toFixed(1) + "k" : count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Write Review Button */}
          <div className="flex items-center justify-center p-8">
            <Button
              variant="outline"
              className="rounded-full px-8 border-primary text-primary hover:bg-primary/5 h-12 font-semibold"
              onClick={handleWriteReviewClick}
            >
              Write your review
            </Button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-10 p-8 border border-border rounded-xl bg-white"
            >
              <h3 className="font-bold text-lg mb-6">Add Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Your review about this product:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        onClick={() => setRating(star)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={star <= rating ? "#FFC107" : "#DFE3E8"}
                          stroke={star <= rating ? "#FFC107" : "#DFE3E8"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={5}
                  placeholder="Review*"
                  className="w-full p-4 rounded-xl border border-border outline-none focus:border-primary resize-none transition-colors"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isAnonymous}
                    disabled={isAnonymous}
                    placeholder="Name *"
                    className="w-full p-4 rounded-full border border-border outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!isAnonymous}
                    disabled={isAnonymous}
                    placeholder="Email *"
                    className="w-full p-4 rounded-full border border-border outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => handleAnonymousToggle(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium text-muted-foreground select-none cursor-pointer"
                  >
                    Post as Anonymous user
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-8 h-12 border-border text-foreground hover:bg-muted"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full px-8 h-12 bg-primary-light hover:bg-primary text-foreground hover:text-primary-foreground hoverEffect"
                  >
                    {isSubmitting ? "Submitting..." : "Post review"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Review List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border">
            <h3 className="font-bold text-[18px]">
              Customer Ratings &amp; Review
            </h3>
            {reviews.length > 0 && (
              <div className="mt-4 sm:mt-0 max-w-[150px] w-full">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full rounded-md border-border h-10">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="highest">Highest Rating</SelectItem>
                    <SelectItem value="lowest">Lowest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  key={
                    review._id ||
                    `${String(review.userId || "anon")}-${review.createdAt || index}`
                  }
                  className="flex flex-col sm:flex-row gap-4 pb-8 border-b border-border last:border-0"
                >
                  <div className="flex gap-4 w-full">
                    <div className="size-12 shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden">
                      {review.userName?.[0] || review.userId?.[0] || "U"}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                        <p className="font-bold text-foreground">
                          {review.userName || review.userId || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <Ratings rating={review.rating} totalReviews={1} />
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          <span className="bg-primary/10 text-primary p-0.5 rounded-full size-4 flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                          Verified
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[15px] pt-1">
                        {review.comment}
                      </p>

                      {/* Helpful / Actions */}
                      <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                        <span>Was this review helpful to you?</span>
                        <button
                          disabled={actionLoading === `like-${review._id}`}
                          onClick={() => handleReviewLike(review._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            hasReacted(review.likes)
                              ? "text-primary"
                              : "hover:text-foreground"
                          } ${actionLoading === `like-${review._id}` ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <ThumbsUp
                            size={14}
                            className={`${hasReacted(review.likes) ? "fill-current" : ""} ${actionLoading === `like-${review._id}` ? "animate-pulse" : ""}`}
                          />{" "}
                          Thank({review.likes?.length || 0})
                        </button>
                        <button
                          disabled={actionLoading === `dislike-${review._id}`}
                          onClick={() => handleReviewDislike(review._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            hasReacted((review as any).dislikes)
                              ? "text-primary"
                              : "hover:text-foreground"
                          } ${actionLoading === `dislike-${review._id}` ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <ThumbsDown
                            size={14}
                            className={`${hasReacted((review as any).dislikes) ? "fill-current" : ""} ${actionLoading === `dislike-${review._id}` ? "animate-pulse" : ""}`}
                          />{" "}
                          Dislike({(review as any).dislikes?.length || 0})
                        </button>
                        <button
                          onClick={() => {
                            setReplyMode(
                              replyMode === review._id ? null : review._id,
                            );
                          }}
                          className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto sm:ml-0"
                        >
                          <MessageSquare size={14} /> Reply
                        </button>
                      </div>

                      {/* Nested Replies (approved only) */}
                      {review.replies &&
                        review.replies.filter(
                          (r: any) => r.isApproved !== false,
                        ).length > 0 && (
                        <div className="mt-4 pl-4 sm:pl-8 border-l-2 border-border space-y-4">
                          {review.replies
                            .filter((r: any) => r.isApproved !== false)
                            .map((reply: any, idx: number) => (
                            <div
                              key={
                                reply._id ||
                                `${String(reply.userId || "reply")}-${reply.createdAt || idx}`
                              }
                              className="flex gap-3"
                            >
                              <div className="size-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden text-xs">
                                {reply.userName?.[0] ||
                                  reply.userId?.[0] ||
                                  "U"}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                                  <p className="font-semibold text-sm text-foreground">
                                    {reply.userName || "Customer"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-muted-foreground text-sm pt-0.5">
                                  {reply.comment}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyMode === review._id && (
                        <div className="mt-4 pl-4 sm:pl-8 animate-in fade-in slide-in-from-top-2 space-y-3">
                          {!isLoggedIn && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={replyName}
                                onChange={(e) => setReplyName(e.target.value)}
                                placeholder="Name *"
                                required
                                className="w-full p-3 rounded-full border border-border outline-none focus:border-primary text-sm"
                              />
                              <input
                                type="email"
                                value={replyEmail}
                                onChange={(e) => setReplyEmail(e.target.value)}
                                placeholder="Email *"
                                required
                                className="w-full p-3 rounded-full border border-border outline-none focus:border-primary text-sm"
                              />
                            </div>
                          )}
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Replying to ${review.userName || "this review"}...`}
                            className="w-full min-h-[80px] p-4 rounded-xl border border-border outline-none focus:border-primary resize-none text-sm bg-muted/30"
                          />
                          <div className="flex justify-end gap-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyMode(null);
                                setReplyText("");
                                setReplyName("");
                                setReplyEmail("");
                              }}
                              className="h-9 px-4 text-xs font-medium"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() =>
                                handleSubmitReply(review._id as string)
                              }
                              disabled={
                                isReplying ||
                                !replyText.trim() ||
                                (!isLoggedIn &&
                                  (!replyName.trim() || !replyEmail.trim()))
                              }
                              className="h-9 px-6 bg-primary text-white text-xs font-medium rounded-full"
                            >
                              {isReplying ? "Posting..." : "Post Reply"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
