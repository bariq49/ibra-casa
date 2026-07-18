"use client";

import React, { useState } from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import { cn } from "@/lib/utils";
import { ChevronRight, ShieldCheck } from "lucide-react";

const privacySections = [
  {
    id: "information-collection",
    title: "1. Information We Collect",
    content: (
      <>
        <p className="mb-4">
          At Sellzy, we prioritize your privacy. We collect information to
          provide better services to all our users. The types of information we
          gather depend on how you interact with our platform.
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
          <li>
            <strong>Personal Data:</strong> Email address, first and last name,
            phone number, and physical shipping/billing addresses provided
            during account registration or checkout.
          </li>
          <li>
            <strong>Transaction Data:</strong> Details of products you purchase,
            seller interactions, and payment method details (processed securely
            via encrypted third parties).
          </li>
          <li>
            <strong>Usage Data:</strong> Information on how you access and use
            the Service, including your IP address, browser type, device
            identifiers, and page visit durations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Data",
    content: (
      <>
        <p className="mb-4">
          Sellzy uses the collected data for various fundamental operational
          purposes, ensuring a seamless and secure eCommerce experience.
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
          <li>
            To provide, manage, and accurately fulfill your marketplace orders.
          </li>
          <li>
            To facilitate communication between you and third-party vendors on
            the platform.
          </li>
          <li>
            To detect, prevent, and address technical issues or fraudulent
            activities.
          </li>
          <li>
            To provide customer support and notify you about changes to our
            Service.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Vendors",
    content: (
      <>
        <p className="mb-4">
          As a multi-vendor marketplace, sharing necessary data is required to
          fulfill your orders. When you purchase an item from a vendor, we share
          strictly the minimal required information (e.g., shipping address,
          name) with that specific vendor to complete the transaction.
        </p>
        <p className="mb-4">
          <strong>Third-Party Service Providers:</strong> We may employ
          third-party companies worldwide (such as Stripe or PayPal for
          payments, AWS for hosting) to facilitate our Service. These parties
          have access to your Personal Data only to perform specific tasks and
          are obligated not to disclose or use it for any other purpose.
        </p>
        <p>
          We do <strong>not</strong> sell your personal data to data brokers or
          advertising networks.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking",
    content: (
      <>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track the activity
          on our Service and hold certain session information (like keeping you
          logged in or saving items to your Cart).
        </p>
        <p>
          You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent. However, if you do not accept cookies,
          essential functions of the eCommerce platform (like the shopping cart)
          will not function properly.
        </p>
      </>
    ),
  },
  {
    id: "data-rights",
    title: "5. Your Privacy Rights (GDPR & CCPA)",
    content: (
      <>
        <p className="mb-4">
          Depending on your location, you may have specific rights regarding
          your personal data. Sellzy extends these core rights globally to all
          users:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 text-muted-foreground">
          <li>
            <strong>The right to access:</strong> You can request copies of your
            personal data from your account dashboard.
          </li>
          <li>
            <strong>The right to erasure:</strong> You have the right to request
            that we securely delete your personal data ("Right to be
            Forgotten").
          </li>
          <li>
            <strong>The right to rectification:</strong> You have the right to
            request that we correct any information you believe is inaccurate.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "6. Data Security",
    content: (
      <>
        <p className="mb-4">
          The security of your data is paramount to us. All transactions are
          encrypted utilizing industry-standard Transport Layer Security (TLS).
        </p>
        <p>
          However, remember that no method of transmission over the Internet, or
          method of electronic storage is 100% secure. While we strive to use
          commercially acceptable, enterprise-grade means to protect your
          Personal Data, we cannot guarantee its absolute security.
        </p>
      </>
    ),
  },
];

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState(privacySections[0].id);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
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
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
              <ShieldCheck className="size-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We believe in transparency. Learn exactly how we collect, use, and
              protect your personal information on the Sellzy platform.
              <br /> Effective Date: March 2026.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative items-start">
            {/* Sticky Navigation Sidebar */}
            <div className="w-full lg:w-1/3 shrink-0 lg:sticky top-[120px] bg-white rounded-3xl border border-border p-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6 pb-4 border-b border-border">
                Table of Contents
              </h3>
              <nav className="flex flex-col space-y-2">
                {privacySections.map((section) => (
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
                  Need to submit a formal Data Subject Access Request (DSAR)?
                </p>
                <button className="w-full h-12 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                  Contact Privacy Team
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-2/3 max-w-4xl bg-white rounded-3xl border border-border p-8 md:p-12 shadow-sm">
              <div className="space-y-16">
                {privacySections.map((section) => (
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
                    Was this policy clear?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We strive to avoid confusing legal jargon.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-full bg-white border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-colors shadow-sm">
                    Yes, it's clear
                  </button>
                  <button className="px-6 py-2.5 rounded-full bg-white border border-border text-foreground font-semibold hover:border-destructive hover:text-destructive transition-colors shadow-sm">
                    No, it's confusing
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

export default PrivacyPolicyPage;
