"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import {
  Mail,
  Phone,
  MapPin,
  Store,
  FileText,
  FileBarChart,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

const vendorSchema = z.object({
  storeName: z.string().min(3, "Shop Name must be at least 3 characters"),
  registrationNumber: z.string().min(3, "Registration Number is required"),
  description: z
    .string()
    .min(10, "Please provide a brief description (min 10 characters)"),
  contactPhone: z
    .string()
    .min(7, "A contact phone number is required")
    .optional()
    .or(z.literal("")),
});

type VendorFormData = z.infer<typeof vendorSchema>;

type VendorState =
  | "loading"
  | "not_applied"
  | "pending"
  | "approved"
  | "rejected";

interface VendorHeroProps {
  initialVendorState?: VendorState;
}

export default function VendorHero({
  initialVendorState = "loading",
}: VendorHeroProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vendorState, setVendorState] =
    useState<VendorState>(initialVendorState);

  // Authentication validation
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuthStore();
  const { onAuthOpen } = useHeaderStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  useEffect(() => {
    const fetchVendorStatus = async () => {
      if (isAuthLoading) return;

      if (!isAuthenticated) {
        setVendorState("not_applied");
        return;
      }
      try {
        const res = await api.get("/api/vendors/me");
        if (res.data?.data) {
          setVendorState(res.data.data.status); // "pending", "approved", or "rejected"
        } else {
          setVendorState("not_applied");
        }
      } catch (error) {
        console.error("Failed to fetch vendor status", error);
        setVendorState("not_applied"); // fallback
      }
    };

    fetchVendorStatus();
  }, [isAuthenticated, isAuthLoading]);

  // Handle automatic redirect if approved
  useEffect(() => {
    if (vendorState === "approved") {
      router.push("/dashboard/vendor");
    }
  }, [vendorState, router]);

  const onSubmit = async (data: VendorFormData) => {
    try {
      setIsLoading(true);

      await api.post("/api/vendors", {
        storeName: data.storeName,
        registrationNumber: data.registrationNumber,
        description: data.description,
        contactPhone: data.contactPhone || undefined,
      });

      toast.success("Vendor application submitted successfully!");
      setVendorState("pending"); // Immediately switch to pending view
    } catch (error: any) {
      console.error("Vendor creation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit vendor application",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (vendorState === "loading" || isAuthLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-[40px] min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-light-secondary-text font-public-sans">
            Checking account status...
          </p>
        </div>
      );
    }

    if (vendorState === "pending") {
      return (
        <div className="flex flex-col items-center justify-center p-[40px] gap-[24px] min-h-[400px] text-center">
          <div className="w-[80px] h-[80px] bg-blue-50 rounded-full flex items-center justify-center mb-[8px]">
            <Clock className="w-[40px] h-[40px] text-blue-500" />
          </div>
          <div className="flex flex-col gap-[8px] max-w-[400px]">
            <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text">
              Application Under Review
            </h3>
            <p className="font-public-sans text-[16px] text-light-secondary-text">
              You have successfully submitted your application to become a
              vendor. It is currently being reviewed by our administrative team.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg py-3 px-6 mt-4 w-full text-sm font-medium">
            Status: Pending Approval
          </div>
        </div>
      );
    }

    if (vendorState === "approved") {
      return (
        <div className="flex flex-col items-center justify-center p-[40px] gap-[24px] min-h-[400px] text-center">
          <div className="w-[80px] h-[80px] bg-green-50 rounded-full flex items-center justify-center mb-[8px]">
            <CheckCircle className="w-[40px] h-[40px] text-green-500" />
          </div>
          <div className="flex flex-col gap-[8px] max-w-[400px]">
            <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text">
              Application Approved
            </h3>
            <p className="font-public-sans text-[16px] text-light-secondary-text">
              Redirecting you to your vendor dashboard...
            </p>
          </div>
        </div>
      );
    }

    if (vendorState === "rejected") {
      return (
        <div className="flex flex-col items-center justify-center p-[40px] gap-[24px] min-h-[400px] text-center">
          <div className="w-[80px] h-[80px] bg-red-50 rounded-full flex items-center justify-center mb-[8px]">
            <XCircle className="w-[40px] h-[40px] text-red-500" />
          </div>
          <div className="flex flex-col gap-[8px] max-w-[400px]">
            <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text">
              Application Rejected
            </h3>
            <p className="font-public-sans text-[16px] text-light-secondary-text">
              Unfortunately, your vendor application was not approved at this
              time. Please contact support for further details.
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg py-3 px-6 mt-4 w-full text-sm font-medium">
            Status: Rejected
          </div>
        </div>
      );
    }

    const isUnauthenticated = !isAuthenticated;

    return (
      <form
        onSubmit={
          isUnauthenticated
            ? (e) => {
                e.preventDefault();
                onAuthOpen("login");
              }
            : handleSubmit(onSubmit)
        }
        className="flex flex-col gap-[32px] p-[24px] sm:p-[32px]"
      >
        {/* Authenticated Context Banner */}
        {isAuthenticated ? (
          <div className="bg-gray-50 rounded-lg p-[16px] border border-gray-100 flex items-center gap-[16px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary/10">
              <Store className="w-[20px] h-[20px] text-primary" />
            </div>
            <div className="flex flex-col flex-1">
              <p className="font-urbanist font-bold text-[14px] text-light-primary-text">
                Applying as: {user?.name}
              </p>
              <div className="flex items-center gap-[6px] text-light-secondary-text mt-0.5">
                <Mail className="w-[12px] h-[12px]" />
                <span className="font-public-sans text-[12px]">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 rounded-lg p-[16px] border border-orange-100 flex items-center gap-[16px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-orange-100">
              <Store className="w-[20px] h-[20px] text-orange-600" />
            </div>
            <div className="flex flex-col flex-1">
              <p className="font-urbanist font-bold text-[14px] text-orange-800">
                Login Required
              </p>
              <p className="font-public-sans text-[12px] text-orange-700 mt-0.5">
                You must be logged in to submit an application.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[24px] w-full">
          {/* Store Name & Registration Number Row */}
          <div className="flex flex-col sm:flex-row gap-[16px] items-start w-full">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="border border-[rgba(145,158,171,0.32)] h-[56px] relative rounded-[12px]">
                <div className="absolute inset-y-0 left-[16px] flex items-center pointer-events-none">
                  <Store className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Shop Name*"
                  disabled={isUnauthenticated || isLoading}
                  {...register("storeName")}
                  className="absolute inset-0 w-full h-full rounded-[12px] pl-[48px] pr-[16px] font-public-sans text-[16px] outline-none focus:border-primary focus:border transition-colors placeholder:text-light-disabled-text bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {errors.storeName && (
                <span className="text-red-500 text-[13px] px-1 mt-1">
                  {errors.storeName.message}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
              <div className="border border-[rgba(145,158,171,0.32)] h-[56px] relative rounded-[12px]">
                <div className="absolute inset-y-0 left-[16px] flex items-center pointer-events-none">
                  <FileBarChart className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Registration M-No*"
                  disabled={isUnauthenticated || isLoading}
                  {...register("registrationNumber")}
                  className="absolute inset-0 w-full h-full rounded-[12px] pl-[48px] pr-[16px] font-public-sans text-[16px] outline-none focus:border-primary focus:border transition-colors placeholder:text-light-disabled-text bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {errors.registrationNumber && (
                <span className="text-red-500 text-[13px] px-1 mt-1">
                  {errors.registrationNumber.message}
                </span>
              )}
            </div>
          </div>

          {/* Contact Phone (Optional but good idea) */}
          <div className="flex flex-col gap-1 w-full">
            <div className="border border-[rgba(145,158,171,0.32)] h-[56px] relative rounded-[12px] w-full">
              <div className="absolute inset-y-0 left-[16px] flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Business Contact Phone (Optional)"
                disabled={isUnauthenticated || isLoading}
                {...register("contactPhone")}
                className="absolute inset-0 w-full h-full rounded-[12px] pl-[48px] pr-[16px] font-public-sans text-[16px] outline-none focus:border-primary focus:border transition-colors placeholder:text-light-disabled-text bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            {errors.contactPhone && (
              <span className="text-red-500 text-[13px] px-1 mt-1">
                {errors.contactPhone.message}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1 w-full">
            <div className="border border-[rgba(145,158,171,0.32)] relative rounded-[12px] w-full p-[16px]">
              <textarea
                placeholder="Briefly describe your business and products...*"
                disabled={isUnauthenticated || isLoading}
                {...register("description")}
                rows={4}
                className="w-full h-full font-public-sans text-[16px] outline-none focus:border-primary transition-colors placeholder:text-light-disabled-text bg-transparent resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            {errors.description && (
              <span className="text-red-500 text-[13px] px-1 mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type={isUnauthenticated ? "button" : "submit"}
          disabled={isAuthenticated && isLoading}
          onClick={isUnauthenticated ? () => onAuthOpen("login") : undefined}
          className="w-full bg-primary px-[22px] py-[14px] rounded-[12px] shadow-color-primary flex items-center justify-center transition-colors hover:bg-primary-dark disabled:opacity-70 mt-[8px]"
        >
          <span className="font-public-sans font-semibold text-white text-[16px]">
            {isUnauthenticated
              ? "Sign In to Apply"
              : isLoading
                ? "Submitting Application..."
                : "Submit Application"}
          </span>
        </button>
      </form>
    );
  };

  return (
    <div className="bg-primary-lighter rounded-[24px] lg:rounded-[48px] w-full flex flex-col xl:flex-row items-center gap-[40px] lg:gap-20 px-[24px] lg:px-[114px] py-[40px] lg:py-[100px]">
      {/* Left: Title Section */}
      <div className="flex-1 min-w-0 flex flex-col gap-[24px] items-start justify-center">
        <div className="flex flex-col gap-[16px] w-full">
          <h1 className="font-urbanist font-bold text-light-primary-text text-[32px] leading-[40px] lg:text-[48px] lg:leading-[64px] w-full">
            Partner with Us — Become a Trusted Vendor
          </h1>
          <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px] w-full">
            Join our growing network of trusted vendors and reach a wider
            audience with ease. We offer the tools, support, and exposure you
            need to scale your business. Start your journey today and unlock new
            opportunities for growth.
          </p>
        </div>
      </div>

      {/* Right: Registration Form Card */}
      <div className="bg-white rounded-[16px] flex flex-col overflow-hidden shrink-0 w-full xl:w-[670px] shadow-sm">
        {/* Title bar */}
        <div className="bg-white border-b border-[rgba(145,158,171,0.24)] pt-[24px] pb-[16px] px-[24px] flex items-start justify-center">
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="font-urbanist font-bold text-light-primary-text text-[20px] leading-[30px] w-full text-center">
              Vendor Application
            </p>
          </div>
        </div>

        {/* Dynamic Content Block */}
        {renderContent()}
      </div>
    </div>
  );
}
