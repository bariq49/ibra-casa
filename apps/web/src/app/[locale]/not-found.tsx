"use client";

import { Link } from "@/i18n/routing";
import { notFoundImage } from "@/images";
import Image from "next/image";
import React from "react";
import * as motion from "motion/react-client";
import { Mail } from "lucide-react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";

export default function NotFoundPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as any },
  };

  return (
    <main className="bg-white overflow-hidden">
      {/* ========== Breadcrumb Section Start ========== */}
      <Breadcrumb />
      {/* ========== Breadcrumb Section End ========== */}

      {/* ========== 404 Section Start ========== */}
      <section className="pb-20 pt-10 text-center">
        <Container>
          <div className="max-w-[600px] mx-auto flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="mb-8"
            >
              <Image
                src={notFoundImage}
                alt="404 Error"
                priority
                className="max-w-full h-auto"
              />
            </motion.div>

            <motion.h2
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="text-4xl md:text-5xl font-urbanist font-bold text-foreground mb-4"
            >
              Oops! Page Not Found
            </motion.h2>

            <motion.p
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
              className="text-dark-secondary-text text-lg mb-10 max-w-[450px]"
            >
              Sorry, the page you're looking for doesn't exist or has been
              moved. Let's get you back on track.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.4 }}
            >
              <Link
                href="/"
                className="btn btn-primary btn-large rounded-full px-10 py-4 font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all"
              >
                Back To Home
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>
      {/* ========== 404 Section End ========== */}

      {/* ========== Subscribe Section Start ========== */}
      <section className="relative pb-20 pt-10">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-[1000px] mx-auto bg-white rounded-[40px] md:rounded-[100px] border border-border p-10 md:px-20 md:py-16 text-center shadow-xl relative z-10 overflow-hidden"
          >
            {/* Decorative backgrounds if needed, or simple clean design */}
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-urbanist font-bold text-foreground mb-4">
                Subscribe to our newsletter
              </h3>
              <p className="text-dark-secondary-text text-lg mb-10 max-w-[500px] mx-auto">
                Stay updated! Subscribe to our mailing list for news, updates,
                and exclusive offers.
              </p>

              <div className="relative w-full md:max-w-[500px] mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-muted rounded-2xl sm:rounded-full border border-border focus-within:border-primary transition-colors">
                  <div className="flex-1 w-full flex items-center gap-3 pl-4">
                    <Mail className="w-6 h-6 text-dark-secondary-text" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full py-3 bg-transparent border-none focus:outline-none text-foreground"
                      id="email-subscribe"
                    />
                  </div>
                  <button className="w-full sm:w-auto btn btn-primary py-3.5 px-8 rounded-xl sm:rounded-full font-bold">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>

        {/* Decorative elements from the original CSS classes if they match the UI */}
        <div className="hidden xl:block absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] pointer-events-none">
          <div className="absolute bottom-10 -left-10 w-[145px] h-[100px] bg-[url('/images/footer-left-shape.png')] bg-no-repeat opacity-50"></div>
          <div className="absolute bottom-10 -right-10 w-[145px] h-[100px] bg-[url('/images/footer-right-shape.png')] bg-no-repeat opacity-50"></div>
        </div>
      </section>
      {/* ========== Subscribe Section End ========== */}
    </main>
  );
}
