import React from "react";
import { redirect } from "next/navigation";
import Container from "@/components/common/Container";
import { UserSidebar } from "@/components/user/UserSidebar";
import { getServerSession } from "@/lib/auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = await getServerSession();

  if (!isLoggedIn) {
    redirect(
      "/?error=login-required&message=Please log in to access your account",
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <Container>
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <UserSidebar />
          <div className="flex-1 w-full">{children}</div>
        </div>
      </Container>
    </div>
  );
}
