"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { MoveLeft, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ComingSoonInner() {
  const searchParams = useSearchParams();
  const pageTitle = searchParams.get("title") || "Coming soon";
  const desc =
    searchParams.get("desc") ||
    "We couldn’t find the page you were looking for. We suggest you return to homepage.";

  // Logic for countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 49,
    minutes: 22,
    seconds: 59,
  });

  useEffect(() => {
    // Simplified countdown for display purposes based on Figma design.
    // To make it fully functional, compute the difference from a target date.
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="bg-white border border-light-divider border-solid flex flex-col gap-10 items-center p-10 relative rounded-[48px] w-full max-w-[608px] mx-auto shadow-sm animate__animated animate__fadeInUp">
      <div className="flex flex-col gap-3 items-center text-center w-full">
        <h2 className="font-urbanist font-bold leading-[1.2] text-light-primary-text text-4xl md:text-5xl w-full">
          {pageTitle}
        </h2>
        <p className="font-public-sans font-normal leading-6 text-light-secondary-text text-base w-full max-w-sm mt-2">
          {desc}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-4 text-center w-full">
        {/* Days */}
        <div className="bg-[rgba(255,72,66,0.08)] border border-error border-solid flex flex-col items-center justify-center pb-1 rounded-[89px] shrink-0 size-16 md:size-20">
          <div className="font-urbanist font-bold mb-[-4px] text-light-primary-text text-xl md:text-2xl">
            <span className="leading-9">{formatNumber(timeLeft.days)}</span>
          </div>
          <div className="font-public-sans font-normal mb-[-4px] text-light-secondary-text text-xs md:text-sm">
            <span className="leading-[22px]">Days</span>
          </div>
        </div>

        <div className="font-urbanist font-bold text-light-primary-text text-2xl">
          <span className="leading-9">:</span>
        </div>

        {/* Hours */}
        <div className="bg-[rgba(255,72,66,0.08)] border border-error border-solid flex flex-col items-center justify-center pb-1 rounded-[89px] shrink-0 size-16 md:size-20">
          <div className="font-urbanist font-bold mb-[-4px] text-light-primary-text text-xl md:text-2xl">
            <span className="leading-9">{formatNumber(timeLeft.hours)}</span>
          </div>
          <div className="font-public-sans font-normal mb-[-4px] text-light-secondary-text text-xs md:text-sm">
            <span className="leading-[22px]">Hours</span>
          </div>
        </div>

        <div className="font-urbanist font-bold text-light-primary-text text-2xl">
          <span className="leading-9">:</span>
        </div>

        {/* Mins */}
        <div className="bg-[rgba(255,72,66,0.08)] border border-error border-solid flex flex-col items-center justify-center pb-1 rounded-[89px] shrink-0 size-16 md:size-20">
          <div className="font-urbanist font-bold mb-[-4px] text-light-primary-text text-xl md:text-2xl">
            <span className="leading-9">{formatNumber(timeLeft.minutes)}</span>
          </div>
          <div className="font-public-sans font-normal mb-[-4px] text-light-secondary-text text-xs md:text-sm">
            <span className="leading-[22px]">Mins</span>
          </div>
        </div>

        <div className="font-urbanist font-bold text-light-primary-text text-2xl">
          <span className="leading-9">:</span>
        </div>

        {/* Secs */}
        <div className="bg-[rgba(255,72,66,0.08)] border border-error border-solid flex flex-col items-center justify-center pb-1 rounded-[89px] shrink-0 size-16 md:size-20">
          <div className="font-urbanist font-bold mb-[-4px] text-light-primary-text text-xl md:text-2xl">
            <span className="leading-9">{formatNumber(timeLeft.seconds)}</span>
          </div>
          <div className="font-public-sans font-normal mb-[-4px] text-light-secondary-text text-xs md:text-sm">
            <span className="leading-[22px]">Secs</span>
          </div>
        </div>
      </div>

      <div className="flex h-12 w-full max-w-[459px]">
        <div className="bg-white border-[rgba(145,158,171,0.32)] border-y border-l border-solid flex-1 h-12 rounded-bl-[80px] rounded-tl-[80px] flex items-center px-4">
          <Mail className="text-light-disabled-text w-5 h-5 mr-2 shrink-0" />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full h-full outline-none text-light-disabled-text text-base font-public-sans bg-transparent"
          />
        </div>
        <button className="bg-sellzy-teal px-[22px] py-[11px] rounded-br-[80px] rounded-tr-[80px] shadow-[0px_6px_15px_0px_rgba(8,129,120,0.16)] shrink-0 transition-colors hover:bg-primary-dark">
          <span className="font-public-sans font-semibold text-base text-white whitespace-nowrap">
            Get Notify
          </span>
        </button>
      </div>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 px-3 py-3 w-full transition-opacity hover:opacity-80"
      >
        <MoveLeft className="w-5 h-5 text-light-primary-text" />
        <span className="font-public-sans font-semibold text-base text-light-primary-text whitespace-nowrap">
          Return to Homepage
        </span>
      </Link>
    </div>
  );
}

export default function ComingSoon() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sellzy-teal border-t-transparent"></div>
        </div>
      }
    >
      <ComingSoonInner />
    </Suspense>
  );
}
