import Container from "@/components/common/Container";
import { setRequestLocale } from "next-intl/server";
import { BarChart3, PackageOpen, Settings, Store } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/product/Breadcrumb";
import { homeIcon } from "@/images";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Vendor dashboard",
};


export default async function VendorDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "Vendor Dashboard" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Container>
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh] py-[40px] lg:py-[80px]">
          <div className="bg-white border border-[rgba(145,158,171,0.24)] rounded-[24px] lg:rounded-[48px] p-[32px] lg:p-[64px] flex flex-col items-center text-center max-w-6xl shadow-sm animate__animated animate__fadeInUp">
            <div className="w-[80px] h-[80px] lg:w-[120px] lg:h-[120px] bg-primary-lighter rounded-full flex items-center justify-center mb-[24px]">
              <Store className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px] text-primary" />
            </div>

            <h1 className="font-urbanist font-bold text-[32px] leading-[40px] lg:text-[48px] lg:leading-[56px] text-light-primary-text mb-[16px]">
              Vendor Dashboard
              <span className="block text-primary mt-2">Coming Soon!</span>
            </h1>

            <p className="font-public-sans text-[16px] lg:text-[18px] leading-[28px] text-light-secondary-text max-w-[600px] mb-[40px]">
              We are finalizing an incredibly powerful, dedicated dashboard for
              our vendors. Very soon, you'll have everything you need to run and
              scale your business effortlessly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full mb-[48px]">
              {/* Feature 1 */}
              <div className="flex flex-col items-center p-[24px] bg-gray-50 rounded-[16px] border border-gray-100">
                <div className="w-[48px] h-[48px] bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-[16px]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-urbanist font-bold text-[18px] text-light-primary-text mb-[8px]">
                  Sales Analytics
                </h3>
                <p className="font-public-sans text-[14px] text-light-secondary-text">
                  Track your real-time revenue, top selling items, and customer
                  growth at a glance.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center p-[24px] bg-gray-50 rounded-[16px] border border-gray-100">
                <div className="w-[48px] h-[48px] bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-[16px]">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="font-urbanist font-bold text-[18px] text-light-primary-text mb-[8px]">
                  Order Fulfillment
                </h3>
                <p className="font-public-sans text-[14px] text-light-secondary-text">
                  Manage inventory levels and fulfill incoming orders with an
                  intuitive workflow.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center p-[24px] bg-gray-50 rounded-[16px] border border-gray-100">
                <div className="w-[48px] h-[48px] bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-[16px]">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="font-urbanist font-bold text-[18px] text-light-primary-text mb-[8px]">
                  Store Settings
                </h3>
                <p className="font-public-sans text-[14px] text-light-secondary-text">
                  Customize your storefront, manage policies, and shape how
                  customers see your brand.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="bg-primary px-[32px] py-[16px] rounded-[80px] shadow-color-primary flex items-center justify-center transition-colors hover:bg-primary-dark"
            >
              <span className="font-public-sans font-semibold text-white text-[16px] leading-[24px]">
                Return to Homepage
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
