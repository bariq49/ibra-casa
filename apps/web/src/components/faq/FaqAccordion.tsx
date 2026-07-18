"use client";

import React, { useState } from "react";
import Container from "@/components/common/Container";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    category: "SHOPPING",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We're always here to help you. Whether you have a question, need support, or just want to learn more about our services, our team is ready to assist you every step of the way.",
      },
      {
        q: "How can I track my order?",
        a: "Once a vendor marks your order as shipped, you will receive an automatic email notification containing a tracking link. You can also monitor real-time shipping updates by logging into your Sellzy account and checking the 'My Orders' dashboard.",
      },
      {
        q: "How long will it take to receive my order?",
        a: "Depending on your location and the shipping method chosen, delivery typically takes between 3 to 7 business days for domestic orders.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, because Sellzy is a global multi-vendor platform, many of our vendors offer international shipping. You can verify shipping availability and rates to your specific country directly on the product checkout page.",
      },
      {
        q: "Can I cancel or modify my order?",
        a: "You can request an order cancellation within 30 minutes of placing it. After this window, the order is typically processed by the seller.",
      },
      {
        q: "Do I need an account to place an order?",
        a: "No, you can check out as a guest. However, creating an account allows you to track your order history and checkout faster in the future.",
      },
    ],
  },
  {
    category: "PAYMENT",
    questions: [
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We do not store your raw credit card numbers on our servers. All transactions are securely routed through PCI-compliant providers like Stripe or PayPal with end-to-end TLS encryption.",
      },
      {
        q: "Why was my payment declined?",
        a: "Payments can be declined for various reasons, including insufficient funds, incorrect billing details, or bank security blocks. Please contact your bank directly or try a different payment method.",
      },
    ],
  },
  {
    category: "RETURNS",
    questions: [
      {
        q: "What is your standard return policy?",
        a: "Return policies are set individually by each vendor. However, Sellzy mandates a minimum 14-day return window for all items sold that arrive damaged or significantly not as described under our Buyer Protection Guarantee.",
      },
      {
        q: "How long does it take to process a refund?",
        a: "Once a vendor receives and inspects your returned item, refunds are processed within 3-5 business days. It may take an additional 2-7 days for the funds to appear on your original payment method depending on your bank.",
      },
    ],
  },
  {
    category: "SHIPPING",
    questions: [
      {
        q: "How much is shipping?",
        a: "Shipping costs are calculated at checkout based on the vendor's location, your delivery address, and the shipping method selected.",
      },
      {
        q: "Do you offer expedited shipping?",
        a: "Many vendors offer expedited shipping options at checkout. Availability depends on the seller and your shipping destination.",
      },
    ],
  },
];

const FaqAccordionRow = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-border bg-white last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
      >
        <h4 className="text-lg font-bold font-urbanist text-foreground group-hover:text-primary transition-colors pr-8">
          {question}
        </h4>
        <div className="shrink-0 size-6 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
        </div>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out font-dm-sans text-muted-foreground text-base",
          isOpen ? "max-h-[500px] pb-6 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="pt-2">{answer}</div>
      </div>
    </div>
  );
};

const FaqAccordion = () => {
  const [activeTab, setActiveTab] = useState(faqData[0].category);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first item

  const activeData = faqData.find((d) => d.category === activeTab);

  const handleTabChange = (category: string) => {
    setActiveTab(category);
    setOpenIndex(null);
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Category Toggle Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {faqData.map((tab) => (
              <button
                key={tab.category}
                onClick={() => handleTabChange(tab.category)}
                className={cn(
                  "px-6 py-3 rounded-full font-medium font-dm-sans text-sm tracking-widest uppercase transition-all duration-300",
                  activeTab === tab.category
                    ? "bg-success/10 text-primary"
                    : "bg-transparent text-foreground hover:bg-muted",
                )}
              >
                {tab.category}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="w-full">
            {activeData?.questions.map((q, idx) => (
              <FaqAccordionRow
                key={idx}
                question={`${idx + 1}. ${q.q}`}
                answer={q.a}
                isOpen={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FaqAccordion;
