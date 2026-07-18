"use client";

import React, { useState } from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const termsSections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p className="mb-4">
          Welcome to Sellzy ("we", "our", "us"). These Terms and Conditions
          govern your use of our website, services, and multi-vendor eCommerce
          platform. By accessing or using Sellzy, you agree to be bound by these
          Terms.
        </p>
        <p>
          If you do not agree with any part of these Terms, you must not use our
          services. We reserve the right to modify these Terms at any time
          without prior notice. Your continued use of the platform constitutes
          acceptance of any changes.
        </p>
      </>
    ),
  },
  {
    id: "user-accounts",
    title: "2. User Accounts & Registration",
    content: (
      <>
        <p className="mb-4">
          To access certain features of Sellzy, you must register for an
          account. You agree to provide accurate, current, and complete
          information during registration and to update such information to keep
          it accurate.
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
          <li>
            You are responsible for safeguarding your password and account
            credentials.
          </li>
          <li>
            You must not share your account or allow any third party to access
            it.
          </li>
          <li>
            We reserve the right to suspend or terminate accounts that violate
            our policies or appear compromised.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "vendor-terms",
    title: "3. Vendor Specific Terms",
    content: (
      <>
        <p className="mb-4">
          Vendors operating on the Sellzy platform are independent contractors.
          By registering as a vendor, you agree to comply with all applicable
          local, national, and international laws regarding the sale of your
          goods.
        </p>
        <p className="mb-4">
          <strong>Content Ownership:</strong> Vendors retain the rights to the
          product images and descriptions they upload. However, by uploading
          content, vendors grant Sellzy a non-exclusive, worldwide license to
          display and promote these items.
        </p>
        <p>
          <strong>Commission & Payouts:</strong> Sellzy deducts a standard
          commission fee from every successful transaction. Payouts are
          processed according to the schedule outlined in the Vendor Agreement
          Dashboard.
        </p>
      </>
    ),
  },
  {
    id: "purchases",
    title: "4. Purchases & Payments",
    content: (
      <>
        <p className="mb-4">
          Prices for products are determined by individual vendors. Sellzy acts
          solely as a facilitator for transactions between buyers and vendors.
        </p>
        <p>
          All payments are processed natively through secure third-party payment
          gateways. You agree to provide valid payment information and authorize
          us to charge your selected payment method for the total order amount,
          including applicable taxes and fees.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    title: "5. Returns, Refunds, and Disputes",
    content: (
      <>
        <p className="mb-4">
          Because Sellzy is a multi-vendor platform, return and refund policies
          may vary strictly by vendor. Buyers are encouraged to read the
          individual vendor's policy before completing a purchase.
        </p>
        <p>
          In the event of a dispute between a buyer and a vendor, Sellzy
          provides a resolution center to facilitate communication. However,
          Sellzy is not legally responsible for resolving disputes or mandating
          refunds unless a transaction violates our core buyer protection
          guarantees.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property",
    content: (
      <>
        <p className="mb-4">
          All original content, features, and functionality provided directly by
          Sellzy (excluding vendor-uploaded content) are owned by Sellzy and are
          protected by international copyright, trademark, patent, trade secret,
          and other intellectual property laws.
        </p>
        <p>
          You may not copy, modify, distribute, or create derivative works from
          our proprietary platform code, designs, or branding blocks.
        </p>
      </>
    ),
  },
  {
    id: "limitation",
    title: "7. Limitation of Liability",
    content: (
      <>
        <p className="mb-4">
          In no event shall Sellzy, nor its directors, employees, partners,
          agents, suppliers, or affiliates, be liable for any indirect,
          incidental, special, consequential or punitive damages, including
          without limitation, loss of profits, data, use, goodwill, or other
          intangible losses.
        </p>
        <p>
          Our platform is provided on an "AS IS" and "AS AVAILABLE" basis. We
          make no warranties regarding the absolute reliability or flawless
          availability of the service.
        </p>
      </>
    ),
  },
];

const TermsAndConditionsPage = () => {
  const [activeSection, setActiveSection] = useState(termsSections[0].id);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      // Offset for header if necessary
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <Breadcrumb />

      <section className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms & <span className="text-primary">Conditions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Please read these terms and conditions carefully before using the
              Sellzy platform. Last updated: March 2026.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative items-start">
            {/* Sticky Navigation Sidebar */}
            <div className="w-full lg:w-1/3 shrink-0 lg:sticky top-[120px] bg-white rounded-3xl border border-border p-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6 pb-4 border-b border-border">
                Table of Contents
              </h3>
              <nav className="flex flex-col space-y-2">
                {termsSections.map((section) => (
                  <button
                    key={`nav-${section.id}`}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex items-center justify-between text-left py-3 px-4 rounded-xl transition-all duration-300 font-medium group",
                      activeSection === section.id
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span>{section.title}</span>
                    <ChevronRight
                      className={cn(
                        "size-4 transition-transform",
                        activeSection === section.id
                          ? "text-white"
                          : "text-muted-foreground group-hover:translate-x-1",
                      )}
                    />
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Have a specific question about our policies?
                </p>
                <button className="w-full h-12 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                  Contact Support
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-2/3 max-w-4xl bg-white rounded-3xl border border-border p-8 md:p-12 shadow-sm">
              <div className="space-y-16">
                {termsSections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-[120px]"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-4 border-b border-border inline-block w-full">
                      {section.title}
                    </h2>
                    <div className="prose prose-lg text-muted-foreground font-medium leading-relaxed max-w-none">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/30 p-8 rounded-2xl">
                <div>
                  <h4 className="font-bold text-foreground text-lg mb-1">
                    Was this page helpful?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Let us know so we can improve our documentation.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-full bg-white border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-colors shadow-sm">
                    Yes
                  </button>
                  <button className="px-6 py-2.5 rounded-full bg-white border border-border text-foreground font-semibold hover:border-destructive hover:text-destructive transition-colors shadow-sm">
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default TermsAndConditionsPage;
