"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Ratings from "../common/products/Ratings";
import { IReview, FullProduct } from "@/hooks/useProductBySlug";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface CustomerReviewsProps {
  productId: string;
  initialReviews: IReview[];
  averageRating: number;
}

export default function CustomerReviews({ productId, initialReviews, averageRating }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<IReview[]>(initialReviews || []);
  const [sortMethod, setSortMethod] = useState("Newest");
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");

  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // Handle Sort
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortMethod === "Highest Rating") return b.rating - a.rating;
    if (sortMethod === "Lowest Rating") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest
  });

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to write a review", {
        action: { label: "Sign In", onClick: () => router.push("/sign-in") }
      });
      return;
    }
    
    // Check if duplicate
    const alreadyReviewed = reviews.some(r => r.userId === user?.id);
    if (alreadyReviewed) {
      toast.warning("You have already reviewed this product.");
      return;
    }
    
    setIsWritingReview(true);
  };

  const submitReview = async () => {
    if (!newReviewComment.trim()) {
      toast.error("Review comment cannot be empty");
      return;
    }
    
    try {
      const { data } = await api.post(PRODUCT_ENDPOINTS.REVIEW(productId), {
        rating: newReviewRating,
        comment: newReviewComment
      });
      toast.success(data.message);
      setReviews(prev => [data.review, ...prev]);
      setIsWritingReview(false);
      setNewReviewComment("");
      setNewReviewRating(5);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like a review");
      return;
    }

    try {
      const { data } = await api.post(PRODUCT_ENDPOINTS.LIKE_REVIEW(productId, reviewId));
      setReviews(prev => prev.map(r => r._id === reviewId ? data.review : r));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to like");
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyComment.trim()) return;

    try {
      const { data } = await api.post(PRODUCT_ENDPOINTS.REPLY_REVIEW(productId, reviewId), {
        comment: replyComment
      });
      setReviews(prev => prev.map(r => r._id === reviewId ? data.review : r));
      setReplyingTo(null);
      setReplyComment("");
      toast.success("Reply added");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reply");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Review Overview */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-muted rounded-3xl p-8 text-center space-y-4 border border-border">
          <p className="font-bold text-foreground">Average Rating</p>
          <h2 className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}/5</h2>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Ratings rating={averageRating} totalReviews={reviews.length} />
          </div>
          <p className="text-muted-foreground">({reviews.length} reviews)</p>
        </div>

        <div className="space-y-4 border border-border rounded-3xl p-6 bg-card">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-x-4">
                <span className="font-semibold text-foreground w-12">{star} Star</span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-warning"
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>

        {!isWritingReview && (
          <Button 
            onClick={handleWriteReviewClick}
            className="w-full h-14 rounded-[12px] border border-primary text-primary hover:bg-primary hover:text-white transition-all bg-card"
          >
            Write a Review
          </Button>
        )}
        
        {isWritingReview && (
          <div className="bg-card border border-border p-6 rounded-[12px] space-y-4">
            <h4 className="font-bold text-lg">Your Review</h4>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} onClick={() => setNewReviewRating(i)} className={`text-2xl ${newReviewRating >= i ? "text-warning" : "text-muted-foreground"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              rows={4}
              placeholder="Share your thoughts..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
            />
            <div className="flex gap-4">
              <Button onClick={submitReview} className="flex-1">Submit</Button>
              <Button variant="outline" onClick={() => setIsWritingReview(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h4 className="text-2xl font-bold">Customer Reviews</h4>
          <select 
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            className="bg-transparent border border-border rounded-[12px] px-4 py-2 text-sm outline-none focus:border-primary"
          >
            <option>Newest</option>
            <option>Highest Rating</option>
            <option>Lowest Rating</option>
          </select>
        </div>

        <div className="space-y-8">
          {sortedReviews.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            sortedReviews.map((review) => (
              <div key={review._id} className="space-y-4 pb-8 border-b border-border last:border-0">
                <div className="flex items-center gap-x-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 uppercase">
                    {review.userName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  <Ratings rating={review.rating} totalReviews={0} />
                  <span className="text-sm font-semibold text-primary">Verified Review</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-6 pt-2">
                  <button 
                    onClick={() => handleLike(review._id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${review.likes?.includes(user?.id || "") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>{review.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) return toast.error("Please sign in to reply");
                      setReplyingTo(replyingTo === review._id ? null : review._id);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{review.replies?.length || 0} Replies</span>
                  </button>
                </div>

                {/* Reply Form */}
                <AnimatePresence>
                  {replyingTo === review._id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-8 pt-4 overflow-hidden"
                    >
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Write a reply..."
                          value={replyComment}
                          onChange={(e) => setReplyComment(e.target.value)}
                          className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Button size="sm" onClick={() => submitReply(review._id)}>Send</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Replies view */}
                {review.replies && review.replies.length > 0 && (
                  <div className="pl-12 mt-4 space-y-4">
                    {review.replies.map((r, i) => (
                      <div key={i} className="bg-muted/50 p-4 rounded-[12px] space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{r.userName}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
