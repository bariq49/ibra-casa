import React from "react";
import Container from "@/components/common/Container";
import { Users, ShoppingCart, Globe2, ShieldCheck } from "lucide-react";

const stats = [
  {
    id: 1,
    icon: Users,
    value: "2.5M+",
    label: "Active Users",
    description: "Buyers interacting across our global network daily.",
  },
  {
    id: 2,
    icon: ShoppingCart,
    value: "50M+",
    label: "Products Sold",
    description: "Successfully delivered to over 150 countries.",
  },
  {
    id: 3,
    icon: Globe2,
    value: "20+",
    label: "Global Offices",
    description: "Dedicated support centers around the world.",
  },
  {
    id: 4,
    icon: ShieldCheck,
    value: "99.9%",
    label: "Secure Uptime",
    description: "Enterprise-grade reliability for your marketplace.",
  },
];

const AboutStats = () => {
  return (
    <section className="py-20 bg-muted/30 border-y border-border">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white p-8 rounded-3xl border border-border hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <stat.icon className="size-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-4xl font-black text-foreground mb-2">
                {stat.value}
              </h3>
              <p className="text-lg font-bold text-foreground mb-3">
                {stat.label}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default AboutStats;
