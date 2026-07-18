import React from "react";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata = {
  title: "Wishlist | Sellzy eCommerce",
};

export default function WishlistV2() {
  return (
    <div className="w-full">
      <WishlistClient title="Wishlist" />
    </div>
  );
}
