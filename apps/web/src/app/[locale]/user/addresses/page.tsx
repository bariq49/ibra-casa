import UserAddressesClient from "@/components/user/UserAddressesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Addresses - User Profile",
};

export default function UserAddressesPage() {
  return <UserAddressesClient />;
}
