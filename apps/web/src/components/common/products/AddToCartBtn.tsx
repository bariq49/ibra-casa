import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import { Product } from "@/components/common/products/ProductCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartBtnProps {
  product: Product;
  compact?: boolean;
  variant?: "default" | "compact" | "beauty" | "grocery";
  className?: string;
  boxClassName?: string;
}

const AddToCartBtn = ({
  product,
  compact = false,
  variant = "default",
  className,
  boxClassName,
}: AddToCartBtnProps) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } =
    useCartStore();

  const pId = (product as any)._id || product.id;
  const pTitle = (product as any).name || product.title;

  // Cart items are stored with a pseudoId key (e.g. "productId-colorId-sizeId").
  // We must match against the product reference inside the item, not item.id.
  const cartItem = cartItems.find((item) => {
    const itemProductId = (item.product as any)?._id || item.product?.id;
    return itemProductId === pId;
  });
  const quantity = cartItem?.quantity || 0;
  // Use the cart item's actual id (pseudoId) for update/remove operations
  const cartItemId = cartItem?.id ?? pId;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    const req = addToCart(product, 1);
    if (req) {
      toast.promise(req, {
        loading: `Adding ${pTitle} to cart...`,
        success: `${pTitle} added to cart`,
        error: `Failed to add ${pTitle} to cart`,
        action: {
          label: "View Cart",
          onClick: () => useHeaderStore.getState().onCartOpen(),
        },
      });
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      if (quantity >= ((product as any).stock || Infinity)) {
        toast.error("Cannot add more than available stock quantity.");
        return;
      }
      updateQuantity(cartItemId, quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(cartItemId, quantity - 1);
    } else {
      const req = removeFromCart(cartItemId);
      if (req) {
        toast.promise(req, {
          loading: `Removing ${pTitle}...`,
          success: `${pTitle} removed from cart`,
          error: `Failed to remove ${pTitle}`,
        });
      }
    }
  };

  // Resolve visual mode since 'compact' boolean might conflict with 'variant'
  const isCompact = compact || variant === "compact";
  const isBeauty = variant === "beauty";

  if (quantity > 0) {
    return (
      <div
        className={cn(
          "flex-1 flex items-center justify-center w-full",
          isCompact ? "size-10 flex-none" : isBeauty ? "h-[44px]" : "h-11",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center border border-border rounded-full bg-white justify-between shadow-sm",
            isCompact
              ? "w-auto h-auto p-1 flex-col gap-1"
              : "p-1.5 w-full h-full",
            boxClassName,
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            onClick={handleDecrease}
            className="text-muted-foreground border border-border hover:bg-muted hover:text-foreground size-6 rounded-full transition-colors flex items-center justify-center shrink-0"
          >
            <Minus className="size-3" />
          </button>
          {!isCompact && (
            <span className="text-sm font-semibold min-w-[20px] text-center text-foreground select-none">
              {quantity}
            </span>
          )}
          <button
            onClick={handleIncrease}
            className="text-primary border border-border hover:bg-primary/10 hover:border-primary/30 size-6 rounded-full transition-colors flex items-center justify-center shrink-0"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  if (isCompact) {
    return (
      <Button
        onClick={handleAdd}
        className="size-10 rounded-full p-0 flex items-center justify-center bg-primary-darker hover:bg-primary-darker/90 text-white shrink-0 shadow-sm"
      >
        <Plus className="size-5" />
      </Button>
    );
  }

  if (isBeauty) {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          "flex-1 flex items-center justify-center gap-[8px] h-[44px] rounded-full bg-primary hover:bg-primary-dark text-white shadow-color-primary transition-all duration-300 w-full",
          className,
        )}
      >
        <ShoppingCart className="size-5" />
        <span className="font-dm-sans font-semibold text-[14px]">
          Add to Cart
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "bg-primary-light flex-[1_0_0] flex gap-[8px] items-center justify-center h-11 px-[22px] rounded-[100px] shadow-color-primary text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 hoverEffect",
        className,
      )}
      aria-label="Add to cart"
    >
      <ShoppingCart className="size-[20px]" />
      <span className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] relative shrink-0 text-[16px]">
        Add
      </span>
    </button>
  );
};

export default AddToCartBtn;
