import {
  AddCircle,
  DeleteIcon,
  EditIcon,
  RemoveCircle,
} from "@/components/svgs";
import { CartItem, useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import PriceFormatter from "../products/PriceFormatter";
import { toast } from "sonner";

import { getCartLinePrices } from "@/lib/priceUtils";

interface Props {
  item: CartItem;
  onCartClose: () => void;
}

const CartSidebarItem = ({ item, onCartClose }: Props) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  // If we somehow have an invalid item in the cart (e.g. from old localStorage state), safely ignore it
  if (!item?.product) {
    return null;
  }

  const pTitle = (item.product as any).name || item.product.title || "Unknown Product";
  const pImage = item.product.image || (item.product as any).images?.[0] || "/images/placeholder.png";
  const pSlug = item.product.slug || item.product.id || "";

  const { originalPrice, discountedPrice } = getCartLinePrices(item);

  return (
    <div
      key={item.id}
      className="flex gap-x-4 p-4 border border-border rounded-[20px] hover:border-primary/30 transition-colors bg-white group"
    >
      <Link
        href={`/product/${pSlug}`}
        onClick={onCartClose}
        className="size-[90px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 p-2"
      >
        <img
          src={pImage}
          alt={pTitle}
          className="w-[85px] h-[85px] object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </Link>
      <div className="flex flex-col flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-x-2">
          <div className="flex flex-col">
            <h6 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              <Link
                href={`/product/${pSlug}`}
                onClick={onCartClose}
              >
                {pTitle}
              </Link>
            </h6>
            {(item.color || item.size) && (
              <p className="text-xs text-muted-foreground mt-1 mb-1">
                {[
                  item.color ? `Color: ${item.color.name || "Default"}` : null,
                  item.size ? `Size: ${item.size.name || "Default"}` : null
                ].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-3 font-medium">Available: {(item.product as any).stock || 0}</p>
          </div>
          <div className="flex items-center gap-x-3 shrink-0 pt-0.5">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <EditIcon className="size-4" />
            </button>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-muted-foreground hover:text-error transition-colors"
            >
              <DeleteIcon className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center gap-x-2">
            <span className="text-[15px] font-bold text-foreground">
              <PriceFormatter amount={discountedPrice} />
            </span>
            {originalPrice > discountedPrice && (
              <span className="text-sm font-medium text-muted-foreground line-through">
                <PriceFormatter amount={originalPrice} />
              </span>
            )}
          </div>

          <div className="flex items-center border border-border rounded-full px-2 py-1 bg-white h-9 w-[90px] justify-between">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 disabled:opacity-50 hoverEffect"
              disabled={item.quantity <= 1}
            >
              <RemoveCircle />
            </button>
            <span className="text-sm font-semibold min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => {
                if (item.quantity >= ((item.product as any).stock || Infinity)) {
                  toast.error("Cannot add more than available stock quantity.");
                  return;
                }
                updateQuantity(item.id, item.quantity + 1);
              }}
              className="text-primary hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center hoverEffect"
            >
              <AddCircle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarItem;
