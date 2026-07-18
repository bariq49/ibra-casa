"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, useRouter } from "@/i18n/routing";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useCartStore } from "@/store/useCartStore";
import CartSidebarItem from "./CartSidebarItem";
import PriceFormatter from "../products/PriceFormatter";
import { useCartTotalsFromStore } from "@/hooks/useStorePricing";

const CartSidebar = () => {
  const { isCartOpen, onCartClose } = useHeaderStore();
  const cartItems = useCartStore((s) => s.cartItems);
  const { subtotalDiscounted } = useCartTotalsFromStore(cartItems);
  const router = useRouter();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && onCartClose()}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-[600px] p-0 border-none sm:top-4 sm:bottom-4 sm:right-4 h-[calc(100svh-32px)] rounded-2xl overflow-hidden shadow-2xl"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border bg-background sticky top-0 z-10 space-y-0">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-xl font-bold text-foreground">
              Shopping Cart
            </SheetTitle>
            <p className="text-sm text-foreground/80 mt-1">
              {cartItems.length} items
            </p>
          </div>
          <button
            onClick={onCartClose}
            className="inline-flex items-center justify-center size-10"
          >
            <X className="size-5 text-foreground" />
          </button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartSidebarItem
                key={item.id}
                item={item}
                onCartClose={onCartClose}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
              <div className="size-20 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="size-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">
                Your cart is empty
              </p>
              <button
                onClick={onCartClose}
                className="w-full h-12 rounded-xl text-primary border-2 border-primary/20 bg-background font-bold hover:bg-primary/5 transition-colors"
              >
                Shopping More
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 pb-10 border-t border-border bg-background sticky bottom-0 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-base font-bold text-foreground">
                Sub Total
              </span>
              <span className="text-xl font-bold text-foreground">
                <PriceFormatter amount={subtotalDiscounted} />
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-bold rounded-full transition-colors"
                onClick={() => {
                  onCartClose();
                  router.push("/cart");
                }}
              >
                View Cart
              </Button>
              <Button
                className="w-full h-12 text-sm font-bold text-foreground rounded-full transition-colors order-first"
                onClick={() => {
                  onCartClose();
                  router.push("/checkout");
                }}
              >
                Proceed to checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
