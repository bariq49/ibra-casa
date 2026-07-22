"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { ApiError, API_ENDPOINTS } from "@/lib/api";

const SubscriptionTab = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        message: string;
      }>(API_ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
        email: trimmedEmail,
        source: "footer",
      });

      toast.success(data?.message || "Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Failed to subscribe. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-4 md:px-0 max-w-[932px] mx-auto text-center lg:pb-6 pb-[70px] lg:rounded-[164px] -mb-[100px] relative z-10 bg-white text-primary xl:before:absolute xl:before:bottom-0 xl:before:left-[-23px] xl:before:h-[100px] xl:before:w-[145px] xl:before:bg-[url('/images/footer-left-shape.png')] xl:before:bg-no-repeat xl:before:z-11 xl:after:absolute xl:after:bottom-0 xl:after:right-[-23px] xl:after:h-[100px] xl:after:w-[145px] xl:after:bg-[url('/images/footer-right-shape.png')] xl:after:bg-no-repeat xl:after:z-11">
      <h3 className="mb-4 text-3xl font-semibold text-light-primary-text">
        Subscribe to our newsletter
      </h3>
      <p className="mb-6 text-light-secondary-text/50">
        Stay updated! Subscribe to our mailing list for news, updates, and
        exclusive offers.
      </p>
      <form
        className="relative flex items-center justify-between w-full md:max-w-[480px] mx-auto p-1.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        onSubmit={handleSubmit}
      >
        <div className="pl-4 pr-3 text-gray-400">
          <Mail className="w-6 h-6" />
        </div>
        <input
          type="email"
          className="flex-1 w-full bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-base h-full py-3 disabled:opacity-60"
          placeholder="Enter your email address"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-light hover:bg-primary-dark text-foreground hover:text-white font-medium px-6 py-3 rounded-full transition-colors duration-300 flex items-center gap-2 group whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default SubscriptionTab;
