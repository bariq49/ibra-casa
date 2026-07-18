import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import React from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Product } from "@/components/common/products/ProductCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistBtnProps {
  product: Product;
  variant?: "default" | "grocery";
}

const WishlistBtn = ({ product, variant = "default" }: WishlistBtnProps) => {
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const pId = (product as any)._id || product.id;
  const pTitle = (product as any).name || product.title;
  const isWishlisted = wishlistItems.some(
    (item) => ((item as any)._id || item.id) === pId,
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const req = toggleWishlist(product);
    if (req) {
      if (!isWishlisted) {
        toast.promise(req, {
          loading: `Adding ${pTitle} to wishlist...`,
          success: `${pTitle} added to wishlist`,
          error: `Failed to add ${pTitle} to wishlist`,
        });
      } else {
        toast.promise(req, {
          loading: `Removing ${pTitle} from wishlist...`,
          success: `${pTitle} removed from wishlist`,
          error: `Failed to remove ${pTitle} from wishlist`,
        });
      }
    }
  };

  if (variant === "grocery") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "size-11 rounded-full border border-gray-200 flex items-center justify-center shrink-0 transition-colors group/wishlist",
          isWishlisted
            ? "bg-[#FF5630] border-[#FF5630] text-white"
            : "bg-transparent text-[#637381] hover:bg-[#FF5630] hover:border-[#FF5630] hover:text-white",
        )}
        aria-label="Wishlist"
      >
        <Heart
          className={cn(
            "size-5 transition-colors",
            isWishlisted ? "fill-white" : "group-hover/wishlist:fill-white",
          )}
        />
      </button>
    );
  }

  return (
    <div>
      <Button
        onClick={handleToggle}
        className={cn(
          "group/wishlist flex flex-none items-center justify-center rounded-[100px] border size-11 transition-colors",
          isWishlisted
            ? "bg-error text-white border-error hover:bg-error hover:text-white"
            : "bg-gray-100 text-sellzy-black/60 border-border hover:bg-error hover:text-white hover:border-error",
        )}
      >
        <Heart
          className={cn(
            "size-5 transition-colors",
            isWishlisted ? "fill-white" : "group-hover/wishlist:fill-white",
          )}
        />
      </Button>
    </div>
  );
};

export default WishlistBtn;
