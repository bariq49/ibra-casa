import React from "react";
import Container from "@/components/common/Container";
import { Search } from "lucide-react";

const FaqHero = () => {
  return (
    <section className="bg-white py-12">
      <Container>
        <div className="bg-sellzy-teal rounded-[24px] py-14 px-8 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold font-urbanist text-white mb-4 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-white/90 mb-8 font-dm-sans max-w-lg mx-auto">
            Find quick answers to common questions.
          </p>

          <div className="w-full max-w-[530px] relative mt-2">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-12 pl-12 pr-6 rounded-full border border-white/20 bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-dm-sans shadow-sm"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FaqHero;
