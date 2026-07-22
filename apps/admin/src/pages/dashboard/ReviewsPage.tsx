import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Star, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { AxiosError } from "axios";
import ReviewSkeleton from "@/components/skeleton/ReviewSkeleton";

type Review = {
  reviewId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  productId: string;
  productName: string;
};

type PendingReply = {
  productId: string;
  productName: string;
  reviewId: string;
  reviewComment: string;
  replyId: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
};

export default function ReviewsPage() {
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [pendingReplies, setPendingReplies] = useState<PendingReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReply, setSelectedReply] = useState<PendingReply | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteReplyDialog, setShowDeleteReplyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch all reviews
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const [pendingResponse, approvedResponse, pendingRepliesResponse] =
        await Promise.all([
          axiosPrivate.get("/products/reviews/pending"),
          axiosPrivate.get("/products/reviews/approved"),
          axiosPrivate.get("/products/reviews/replies/pending"),
        ]);
      setPendingReviews(pendingResponse.data || []);
      setApprovedReviews(approvedResponse.data || []);
      setPendingReplies(pendingRepliesResponse.data || []);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Approve review
  const handleApprove = async (productId: string, reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await axiosPrivate.put(`/products/${productId}/review/${reviewId}`, {
        approve: true,
      });
      toast({
        title: "Success",
        description: "Review approved successfully",
      });
      // Refresh to get updated lists
      await fetchAllReviews();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to approve review",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete review (reject pending or delete approved)
  const handleDelete = async (productId: string, reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await axiosPrivate.put(`/products/${productId}/review/${reviewId}`, {
        approve: false,
      });
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      // Refresh to get updated lists
      await fetchAllReviews();
      setShowDeleteDialog(false);
      setSelectedReview(null);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to delete review",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReply = async (reply: PendingReply) => {
    try {
      setActionLoading(reply.replyId);
      await axiosPrivate.put(
        `/products/${reply.productId}/review/${reply.reviewId}/reply/${reply.replyId}`,
        { approve: true },
      );
      toast({
        title: "Success",
        description: "Reply approved successfully",
      });
      await fetchAllReviews();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to approve reply",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReply = async (reply: PendingReply) => {
    try {
      setActionLoading(reply.replyId);
      await axiosPrivate.put(
        `/products/${reply.productId}/review/${reply.reviewId}/reply/${reply.replyId}`,
        { approve: false },
      );
      toast({
        title: "Success",
        description: "Reply rejected successfully",
      });
      await fetchAllReviews();
      setShowDeleteReplyDialog(false);
      setSelectedReply(null);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to reject reply",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating ? "fill-warning-main text-warning-main" : "text-grey-300"
            }
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer reviews and feedback
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllReviews}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Reviews ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="pending-replies">
            Pending Replies ({pendingReplies.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                Review and approve or reject customer feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ReviewSkeleton />
              ) : pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No pending reviews at the moment
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReviews.map((review) => (
                        <TableRow key={review.reviewId}>
                          <TableCell className="font-medium">
                            {review.productName}
                          </TableCell>
                          <TableCell>{review.userName}</TableCell>
                          <TableCell>{renderStars(review.rating)}</TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2 text-sm">
                              {review.comment}
                            </p>
                          </TableCell>
                          <TableCell>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleApprove(
                                    review.productId,
                                    review.reviewId,
                                  )
                                }
                                disabled={actionLoading === review.reviewId}
                              >
                                {actionLoading === review.reviewId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={actionLoading === review.reviewId}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Replies Tab */}
        <TabsContent value="pending-replies">
          <Card>
            <CardHeader>
              <CardTitle>Pending Replies</CardTitle>
              <CardDescription>
                Approve or reject guest replies before they appear on the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ReviewSkeleton />
              ) : pendingReplies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No pending replies at the moment
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Reply</TableHead>
                        <TableHead>On review</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReplies.map((reply) => (
                        <TableRow key={reply.replyId}>
                          <TableCell className="font-medium">
                            {reply.productName}
                          </TableCell>
                          <TableCell>{reply.userName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {reply.userEmail || "—"}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2 text-sm">{reply.comment}</p>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {reply.reviewComment}
                            </p>
                          </TableCell>
                          <TableCell>
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveReply(reply)}
                                disabled={actionLoading === reply.replyId}
                              >
                                {actionLoading === reply.replyId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedReply(reply);
                                  setShowDeleteReplyDialog(true);
                                }}
                                disabled={actionLoading === reply.replyId}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Reviews Tab */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Reviews</CardTitle>
              <CardDescription>
                Currently visible reviews on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ReviewSkeleton />
              ) : approvedReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No approved reviews yet
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedReviews.map((review) => (
                        <TableRow key={review.reviewId}>
                          <TableCell className="font-medium">
                            {review.productName}
                          </TableCell>
                          <TableCell>{review.userName}</TableCell>
                          <TableCell>{renderStars(review.rating)}</TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2 text-sm">
                              {review.comment}
                            </p>
                          </TableCell>
                          <TableCell>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedReview(review);
                                setShowDeleteDialog(true);
                              }}
                              disabled={actionLoading === review.reviewId}
                            >
                              {actionLoading === review.reviewId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone and the review will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="my-4 p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">{selectedReview.productName}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedReview.userName}
                </span>
                {renderStars(selectedReview.rating)}
              </div>
              <p className="text-sm">{selectedReview.comment}</p>
            </div>
          )}
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              className="bg-error-main hover:bg-error-dark text-white"
              onClick={() => {
                if (selectedReview) {
                  handleDelete(
                    selectedReview.productId,
                    selectedReview.reviewId,
                  );
                }
              }}
            >
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteReplyDialog}
        onOpenChange={setShowDeleteReplyDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Reply?</DialogTitle>
            <DialogDescription>
              This will permanently remove the pending reply.
            </DialogDescription>
          </DialogHeader>
          {selectedReply && (
            <div className="my-4 p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">{selectedReply.productName}</p>
              <p className="text-sm text-muted-foreground">
                {selectedReply.userName}
                {selectedReply.userEmail ? ` (${selectedReply.userEmail})` : ""}
              </p>
              <p className="text-sm">{selectedReply.comment}</p>
            </div>
          )}
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteReplyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-error-main hover:bg-error-dark text-white"
              onClick={() => {
                if (selectedReply) handleDeleteReply(selectedReply);
              }}
            >
              Reject Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
