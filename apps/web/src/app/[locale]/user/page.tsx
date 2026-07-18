import { redirect } from "@/i18n/routing";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "User Profile",
};


export default function UserPage() {
  redirect({ href: "/user/dashboard", locale: "en" });
}
