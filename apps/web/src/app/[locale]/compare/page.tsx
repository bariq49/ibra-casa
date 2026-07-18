import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import Container from "@/components/common/Container";
import ComparePageClient from "./ComparePageClient";

export const metadata = {
  title: "Compare Products - Sellzy",
  description: "Compare your selected products side by side.",
};

const ComparePage = () => {
  return (
    <main className="bg-white min-h-screen">
      <Breadcrumb />

      <section>
        <Container>
          <div className="mb-10">
            <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-foreground font-Urbanist mb-4">
              Compare
            </h1>
          </div>

          <ComparePageClient />
        </Container>
      </section>
    </main>
  );
};

export default ComparePage;
