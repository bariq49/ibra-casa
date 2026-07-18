import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms And Conditions",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
