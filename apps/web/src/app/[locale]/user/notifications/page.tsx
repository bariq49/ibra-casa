import React from "react";
import { NotificationsListClient } from "@/components/user/NotificationsListClient";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Notifications",
};


export default function NotificationsPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <NotificationsListClient />
    </div>
  );
}
