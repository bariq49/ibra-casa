import React from "react";
import Container from "@/components/common/Container";
import {
  HeartHandshake,
  Map,
  Wallet,
  Laptop,
  GraduationCap,
  Coffee,
} from "lucide-react";

const perks = [
  {
    icon: Map,
    title: "Work from Anywhere",
    description:
      "Whether you thrive in an office, love your home setup, or work best from a coffee shop in Bali, we support it.",
  },
  {
    icon: HeartHandshake,
    title: "Comprehensive Health",
    description:
      "Top-tier health, dental, and vision insurance for you and your dependents. We cover 100% of the premiums.",
  },
  {
    icon: Wallet,
    title: "Competitive Compensation",
    description:
      "We offer top-of-market salaries, substantial equity packages, and annual performance-based bonuses.",
  },
  {
    icon: Laptop,
    title: "Home Office Budget",
    description:
      "Get a $2,000 stipend to set up your ideal workspace, plus a brand new MacBook Pro on day one.",
  },
  {
    icon: GraduationCap,
    title: "Learning Stipend",
    description:
      "An annual $1,500 budget for books, courses, conferences, or anything that helps you grow professionally.",
  },
  {
    icon: Coffee,
    title: "Flexible Time Off",
    description:
      "We focus on outcomes, not hours. Take the time you need to recharge, with a minimum required 15 days off.",
  },
];

const CareersBenefits = () => {
  return (
    <section className="py-20 md:py-32 bg-white border-y border-border">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Benefits built to support you
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We demand the best from our team, which means we provide the
            absolute best in return. Your well-being and growth are our top
            priorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-3xl bg-background border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-white border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <perk.icon className="size-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {perk.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default CareersBenefits;
