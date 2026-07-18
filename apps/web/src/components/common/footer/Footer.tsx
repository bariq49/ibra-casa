import { Link } from "@/i18n/routing";
import Container from "../Container";
import SocialIcons from "../SocialIcons";
import { ChevronRight, Globe, Phone, Mail, Printer } from "lucide-react";
import FooterBottomNavbar from "./FooterBottomNavbar";
import SubscriptionTab from "./SubscriptionTab";

const footerSections = [
  {
    title: "About",
    children: [
      {
        label: "About Us",
        href: "/about",
      },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Careers", href: "/careers" },
      { label: "Latest News", href: "/blogs" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
  {
    title: "My Account",
    children: [
      { label: "Your Account", href: "/user/dashboard" },
      {
        label: "Return Policies",
        href: "/coming-soon?title=Return Policies&desc=Our return guidelines will be published here soon.",
      },
      { label: "Become a Vendor", href: "/vendor-registration" },
      { label: "Wishlist", href: "/wishlist-style-v1" },
      {
        label: "Affiliate Program",
        href: "/coming-soon?title=Affiliate Program&desc=Our affiliate program details will be available soon.",
      },
      {
        label: "FAQs",
        href: "/faq",
      },
    ],
  },
  {
    title: "Categories",
    children: [
      { label: "Healthcare", href: "/shop?category=healthcare" },
      { label: "Fashion", href: "/shop?category=fashion" },
      { label: "Organic", href: "/shop?category=organic" },
      { label: "Beauty", href: "/shop?category=beauty" },
      { label: "Groceries", href: "/shop?category=groceries" },
      { label: "Others", href: "/shop?category=others" },
    ],
  },
];

export default function Footer() {
  return (
    <div className="text-primary-foreground/80">
      {/* ========== Subscribe Section Start ========== */}
      <SubscriptionTab />
      {/* ========== Subscribe Section End ========== */}

      {/* ========== Footer Section Start ========== */}
      <footer className="md:pb-15 pb-[100px] bg-primary-darker pt-40 xl:rounded-tr-[22px] xl:rounded-tl-[22px]">
        <Container className="">
          {/* ========== Footer Top Section Start ========== */}
          <div className="pb-9 grid grid-cols-12 gap-6">
            <div className="md:col-span-12 col-span-12 xl:col-span-3 flex flex-col gap-y-6 animate__animated animate__fadeInUp">
              <div>
                <Link href="/">
                  <img src="/images/footer-logo.svg" alt="logo" />
                </Link>
              </div>
              <p className="text-primary-lighter text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <SocialIcons />
              <div className="flex flex-col gap-y-[15px]">
                <p className="text-base font-semibold text-primary-lighter">
                  Download Our App:
                </p>
                <div className="flex gap-x-2.5">
                  <Link href="/">
                    <img
                      src="/images/google-play.png"
                      alt="google-play"
                    />
                  </Link>
                  <Link href="/">
                    <img
                      src="/images/apple-store.png"
                      alt="apple-store"
                    />
                  </Link>
                </div>
              </div>
            </div>
            {footerSections.map((section, index) => (
              <div
                key={index}
                className="md:col-span-6 col-span-12 xl:col-span-2 animate__animated animate__fadeInUp"
              >
                <h5 className="text-primary-lighter pb-6 border-b border-[rgba(145,158,171,0.24)]">
                  {section.title}
                </h5>
                <div className="flex flex-col gap-y-2 pt-4">
                  {section.children.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="py-1.5 flex items-center gap-x-2 text-primary-lighter hover:text-white group transition-all duration-300"
                    >
                      <ChevronRight
                        size={16}
                        className="text-primary-lighter/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                      />
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-300">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="md:col-span-6 col-span-12 xl:col-span-3 animate__animated animate__fadeInUp">
              <h5 className="text-primary-lighter pb-6 border-b border-[rgba(145,158,171,0.24)]">
                Contact Information
              </h5>
              <div className="flex flex-col gap-y-1.5 py-4">
                <div className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[rgba(145,158,171,0.16)]">
                    <Globe className="w-6 h-6 text-primary-lighter" />
                  </span>
                  <p className="text-primary-lighter font-semibold">
                    2715 Ash Dr. San Jose, South Dakota 83475
                  </p>
                </div>
                <div className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[rgba(145,158,171,0.16)]">
                    <Phone className="w-6 h-6 text-primary-lighter" />
                  </span>
                  <p className="text-primary-lighter font-semibold">
                    Call Us: (239) 555-0108
                  </p>
                </div>
                <div className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[rgba(145,158,171,0.16)]">
                    <Mail className="w-6 h-6 text-primary-lighter" />
                  </span>
                  <p className="text-primary-lighter font-semibold">
                    sara.cruz@example.com
                  </p>
                </div>
                <div className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[rgba(145,158,171,0.16)]">
                    <Printer className="w-6 h-6 text-primary-lighter" />
                  </span>
                  <p className="text-primary-lighter font-semibold">
                    sara.cruz@example.com
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/images/payment-methods.png"
                  alt="payment-methods"
                />
              </div>
            </div>
          </div>
          {/* ========== Footer Top Section End ========== */}

          {/* ========== Footer Bottom Section Start ========== */}
          <div className="text-center text-white bg-[url('/images/bottom-border.png')] pt-[22px] bg-center pb-px bg-no-repeat animate__animated animate__fadeInUp">
            2026 Copyright By Themeforest Powered By Createuiux
          </div>
          {/* ========== Footer Bottom Section End ========== */}
        </Container>
      </footer>
      {/* ========== Footer Section End ========== */}

      <FooterBottomNavbar />
    </div>
  );
}
