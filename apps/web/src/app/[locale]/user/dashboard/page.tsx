"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "lucide-react";

export default function UserDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full bg-white border-border rounded-[16px] shadow-sm p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-4 font-urbanist">
            Welcome, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            From your account dashboard you can view your recent orders, manage
            your shipping and billing addresses, and edit your password and
            account details.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Account Info */}
        <Card className="w-full bg-white border-border rounded-[16px] shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground font-urbanist">
              Account Info
            </h2>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="size-6 text-primary" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-foreground text-lg">
                  {user?.name || "User"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user?.email || "No email available"}
                </span>
              </div>
            </div>
            {user?.role && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <span className="text-sm font-semibold capitalize px-2.5 py-1 bg-success/10 text-success rounded-full">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Note: The Billing Address is typically managed as an array or a specific profile field which is usually updated from Settings or Checkout. Defaulting to an encouragement text if exact data not available */}
        <Card className="w-full bg-white border-border rounded-[16px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground font-urbanist">
              Billing Address
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 min-h-[100px] justify-center">
            {/* Realistically, this would pull from user.addresses. If none exist: */}
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="size-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
                You haven't set up a default billing address yet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
