import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Settings",
};


export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full bg-white border-border rounded-[16px] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Account Settings
        </h1>

        <form className="flex flex-col gap-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                First Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                placeholder="John"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Last Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-muted/50 cursor-not-allowed"
              placeholder="john.doe@example.com"
              disabled
            />
          </div>

          <Button
            type="button"
            className="w-fit px-8 rounded-full font-bold mt-2"
          >
            Save Changes
          </Button>
        </form>
      </Card>

      <Card className="w-full bg-white border-border rounded-[16px] shadow-sm p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Change Password
        </h2>

        <form className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="button"
            className="w-fit px-8 rounded-full font-bold mt-2"
          >
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
