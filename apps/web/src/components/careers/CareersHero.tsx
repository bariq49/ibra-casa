import React from "react";
import Image from "next/image";
import Container from "@/components/common/Container";

const CareersHero = ({ collageImages = [] }: { collageImages?: string[] }) => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

      <Container>
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto relative z-10">
          <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm uppercase tracking-widest mb-6">
            Join Our Team
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8">
            Build the Future of <br />
            <span className="relative inline-block text-primary mt-2">
              Global E-commerce.
              <svg
                className="absolute w-full h-4 -bottom-2 left-0 text-warning opacity-80"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.00018 8.42211C81.4326 -0.662705 207.989 -1.68536 298 8.42211"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
            At Sellzy, we're not just building a marketplace; we're building an
            ecosystem that empowers entrepreneurs worldwide. Join us to solve
            complex, high-scale engineering and design challenges.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="h-14 px-8 rounded-full bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              View Open Roles
            </button>
            <button className="h-14 px-8 rounded-full bg-white text-foreground border border-border font-bold text-base hover:bg-muted transition-colors">
              Our Culture
            </button>
          </div>
        </div>

        {/* Masonry Image Grid */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center">
          <div className="space-y-4 md:space-y-6 lg:-translate-y-8">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
              {collageImages[0] ? (
                <Image
                  src={collageImages[0]}
                  alt="Team Work"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
            </div>
          </div>
          <div className="space-y-4 md:space-y-6 lg:translate-y-12">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group">
              {collageImages[1] ? (
                <Image
                  src={collageImages[1]}
                  alt="Office Collaboration"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted group">
              {collageImages[2] ? (
                <Image
                  src={collageImages[2]}
                  alt="Whiteboard Session"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
            </div>
          </div>
          <div className="space-y-4 md:space-y-6 lg:-translate-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted group bg-primary flex flex-col items-center justify-center p-8">
              <h3 className="text-white font-bold text-2xl md:text-3xl text-center leading-tight">
                100%
                <br />
                <span className="text-lg font-medium opacity-80 mt-2 block">
                  Remote Friendly
                </span>
              </h3>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group">
              {collageImages[3] ? (
                <Image
                  src={collageImages[3]}
                  alt="Brainstorming"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
            </div>
          </div>
          <div className="space-y-4 md:space-y-6 lg:translate-y-8">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
              {collageImages[4] ? (
                <Image
                  src={collageImages[4]}
                  alt="Design Review"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CareersHero;
