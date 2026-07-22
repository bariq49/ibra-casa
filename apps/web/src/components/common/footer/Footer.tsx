import { Link } from "@/i18n/routing";
import Container from "../Container";
import SocialIcons from "../SocialIcons";
import { ChevronRight, Globe, Mail } from "lucide-react";
import FooterBottomNavbar from "./FooterBottomNavbar";
import SubscriptionTab from "./SubscriptionTab";
import { APP_DEFAULTS } from "@/constants/app-defaults";

const footerSections = [
  {
    title: "About",
    children: [
      {
        label: "About Us",
        href: "/about",
      },
      { label: "Latest News", href: "/blogs" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "My Account",
    children: [
      { label: "Your Account", href: "/user/dashboard" },
      { label: "Become a Vendor", href: "/vendor-registration" },
      {
        label: "Most Asked FAQs",
        href: "/faq",
      },
    ],
  },
  {
    title: "Privacy Policy",
    children: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      {
        label: "Return Policies",
        href: "/coming-soon?title=Return Policies&desc=Our return guidelines will be published here soon.",
      },
    ],
  },
];

export default function Footer() {
  const { description, address, email, copyright } = APP_DEFAULTS.footer;

  return (
    <div className="text-primary-foreground/80">
      <SubscriptionTab />
      <footer className=" bg-primary-darker pt-40">
        <Container className="">
          <div className="pb-9 grid grid-cols-12 gap-6">
            <div className="md:col-span-12 col-span-12 xl:col-span-3 flex flex-col gap-y-6 animate__animated animate__fadeInUp">
              <div>
                <Link href="/">
                  <img src="/images/footer-logo.svg" alt="logo" />
                </Link>
              </div>
              <p className="text-white text-base">{description}</p>
              <SocialIcons />
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
                      className="py-1.5 flex items-center gap-x-2 text-white hover:text-primary-lighter/70 group transition-all duration-300"
                    >
                      <ChevronRight
                        size={16}
                        className="text-white group-hover:text-primary-lighter/70 group-hover:translate-x-1 transition-all duration-300"
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
                    <Globe className="w-6 h-6 text-white" />
                  </span>
                  <p className="text-white font-semibold">{address}</p>
                </div>
                <div className="flex items-center gap-x-3">
                  <span className="size-10 inline-flex items-center justify-center rounded-full bg-[rgba(145,158,171,0.16)]">
                    <Mail className="w-6 h-6 text-white" />
                  </span>
                  <p className="text-white font-semibold">{email}</p>
                </div>
              </div>
              <div>
                <img src="/images/payment-methods.png" alt="payment-methods" />
              </div>
            </div>
          </div>
          <div className="relative mt-4 pt-12 pb-3 text-center animate__animated animate__fadeInUp">
            {/* Smooth teal divider with centered arch over copyright */}
            <svg
              className="absolute top-0 left-0 w-full h-14 text-primary-lighter pointer-events-none"
              viewBox="0 0 1400 56"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              <path
                d="M0 34
                   H360
                   C420 34 455 34 490 22
                   C530 8 570 4 700 4
                   C830 4 870 8 910 22
                   C945 34 980 34 1040 34
                   H1400"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <p className="relative z-10 text-white text-sm sm:text-base px-6 sm:px-10">
              {copyright}
            </p>
          </div>
        </Container>
      </footer>

      <FooterBottomNavbar />
    </div>
  );
}
