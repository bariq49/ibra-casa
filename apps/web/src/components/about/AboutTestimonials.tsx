"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/common/Container";

export const staticTestimonials = [
  {
    _id: "1",
    name: "Robert Fox",
    date: "12:40PM, 14 Nov, 2026",
    rating: 4.5,
    text: "I was honestly surprised at how fast the delivery was. The product came well-packaged and exactly as described. Great quality, and the free fast shipping made the experience even better!",
    avatar: "https://i.pravatar.cc/150?img=11",
    isVerified: true,
  },
  {
    _id: "2",
    name: "James Smith",
    date: "12:40PM, 14 Nov, 2026",
    rating: 4.5,
    text: "From browsing to checkout, everything was super easy. Loved how I didn’t have to pay anything extra for shipping, and my item arrived the next day. Highly recommend!",
    avatar: "https://i.pravatar.cc/150?img=12",
    isVerified: true,
  },
  {
    _id: "3",
    name: "Sarah Jenkins",
    date: "09:15AM, 12 Nov, 2026",
    rating: 5.0,
    text: "Absolutely fantastic customer service. They answered all my queries quickly and the delivery was incredibly swift. I'll definitely be shopping here again.",
    avatar: "https://i.pravatar.cc/150?img=5",
    isVerified: true,
  },
  {
    _id: "4",
    name: "Michael Chen",
    date: "04:30PM, 10 Nov, 2026",
    rating: 4.0,
    text: "Good products and reasonable prices. The delivery was free which is a huge plus. The packaging was also very secure.",
    avatar: "https://i.pravatar.cc/150?img=14",
    isVerified: true,
  },
  {
    _id: "5",
    name: "Emily Rodriguez",
    date: "11:20AM, 08 Nov, 2026",
    rating: 5.0,
    text: "This is my third time ordering and they never disappoint. The quality of the items is consistently high and shipping is always on time.",
    avatar: "https://i.pravatar.cc/150?img=9",
    isVerified: true,
  },
  {
    _id: "6",
    name: "David Kim",
    date: "02:10PM, 05 Nov, 2026",
    rating: 4.5,
    text: "Very user-friendly website. I found exactly what I needed in minutes. Checkout was a breeze and the items arrived in perfect condition.",
    avatar: "https://i.pravatar.cc/150?img=15",
    isVerified: true,
  },
  {
    _id: "7",
    name: "Jessica Taylor",
    date: "10:05AM, 01 Nov, 2026",
    rating: 5.0,
    text: "I was hesitant at first, but the reviews were right. Exceptional service and top-notch products. The free shipping is the cherry on top.",
    avatar: "https://i.pravatar.cc/150?img=20",
    isVerified: true,
  },
  {
    _id: "8",
    name: "William Brown",
    date: "03:45PM, 28 Oct, 2026",
    rating: 4.0,
    text: "Great selection of products. I had a minor issue with my order but customer support resolved it immediately. Very satisfied.",
    avatar: "https://i.pravatar.cc/150?img=33",
    isVerified: true,
  },
  {
    _id: "9",
    name: "Ashley Davis",
    date: "08:30AM, 25 Oct, 2026",
    rating: 5.0,
    text: "The best online shopping experience I've had in a while. Fast, reliable, and exactly what I ordered. Will be recommending to friends.",
    avatar: "https://i.pravatar.cc/150?img=42",
    isVerified: true,
  },
  {
    _id: "10",
    name: "Christopher Wilson",
    date: "01:15PM, 20 Oct, 2026",
    rating: 4.5,
    text: "Impressive processing speed. My order was shipped within hours of placing it. The quality of the merchandise exceeded my expectations.",
    avatar: "https://i.pravatar.cc/150?img=53",
    isVerified: true,
  },
];

export const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-[18px] h-[18px] ${
            rating >= star
              ? "text-yellow-400"
              : rating >= star - 0.5
                ? "text-yellow-400"
                : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export interface CustomerReview {
  _id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  isVerified?: boolean;
}

interface AboutTestimonialsProps {
  reviews?: CustomerReview[];
}

export default function AboutTestimonials({ reviews = [] }: AboutTestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const displayReviews = reviews.length > 0 ? reviews : staticTestimonials;

  return (
    <Container className="w-full relative mt-16 mb-20 overflow-hidden flex flex-col items-center">
      {/* SVG Background (Desktop Only) */}
      {/* <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden rounded-2xl px-6 sm:px-8 md:px-10 lg:px-12">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1728 611"
          fill="none"
        >
          <path
            d="M1728 595C1728 603.837 1720.837 611 1712 611H16C7.163 611 0 603.837 0 595V16C0 7.163 7.163 0 16 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 103 615.5 103H1112.5C1152.92 103 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1712C1719.837 0 1728 7.163 1728 16V595Z"
            fill="#F4F3F5"
          />
        </svg>
      </div> */}

      {/* Solid Background (Mobile/Tablet Only) */}
      {/* <div
        className="absolute inset-0 z-0 bg-[#F4F3F5] lg:hidden rounded-2xl"
        aria-hidden
      /> */}

      {/* Title sits in the SVG notch */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4 pt-2 sm:pt-3 lg:pt-1 mb-8 lg:mb-20">
        <h2 className="text-3xl md:text-4xl lg:text-[40px] font-urbanist font-bold text-light-primary-text leading-tight">
          Trusted by Customers
        </h2>
        <p className="text-base font-dm-sans text-light-secondary-text mt-1">
          Join thousands of happy customers around the globe.
        </p>
      </div>

      {/* Cards / nav — horizontal inset inside the gray band */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 md:px-8 lg:pb-16 pb-6">
        {/* Embla Carousel */}
        <div className="overflow-hidden mb-10 w-full" ref={emblaRef}>
          <div className="flex -ml-4 md:-ml-6 pb-4">
            {displayReviews.map((testimonial) => (
              <div
                key={testimonial._id}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 md:pl-6"
              >
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm h-full flex flex-col justify-between border border-gray-100 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={
                            testimonial.avatar ||
                            "/images/avatar-placeholder.png"
                          }
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-urbanist font-bold text-light-primary-text text-base truncate">
                          {testimonial.name}
                        </p>
                        <p className="font-dm-sans text-light-secondary-text text-sm">
                          {testimonial.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <RatingStars rating={testimonial.rating} />
                        <span className="font-dm-sans text-sm font-bold text-light-primary-text leading-none">
                          {Number(testimonial.rating).toFixed(1)}
                        </span>
                      </div>

                      {testimonial.isVerified && (
                        <>
                          <div className="w-px h-4 bg-gray-200" />
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-dm-sans text-sm text-primary font-medium">
                              Verified purchase
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <p className="font-dm-sans text-light-secondary-text text-[15px] leading-relaxed">
                      <span className="font-urbanist font-bold text-xl leading-none text-light-secondary-text/40">
                        “
                      </span>{" "}
                      {testimonial.text}{" "}
                      <span className="font-urbanist font-bold text-xl leading-none text-light-secondary-text/40">
                        ”
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={scrollPrev}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-light-primary-text shadow-sm hover:shadow-md transition-shadow border border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-light-primary-text shadow-sm hover:shadow-md transition-shadow border border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Container>
  );
}
