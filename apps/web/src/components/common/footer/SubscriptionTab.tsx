"use client";
import { Mail, ArrowRight } from "lucide-react";

const SubscriptionTab = () => {
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
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="pl-4 pr-3 text-gray-400">
          <Mail className="w-6 h-6" />
        </div>
        <input
          type="email"
          className="flex-1 w-full bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-base h-full py-3"
          placeholder="Enter your email address"
          name="email"
          id="email"
          required
        />
        <button
          type="submit"
          className="bg-primary-light hover:bg-primary-dark text-foreground hover:text-white font-medium px-6 py-3 rounded-full transition-colors duration-300 flex items-center gap-2 group whitespace-nowrap"
        >
          Subscribe
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </form>
    </section>
  );
};

export default SubscriptionTab;
