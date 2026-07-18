"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

interface TopRatedProductsClientProps {
  heroProduct: ApiProduct;
  gridProducts: ApiProduct[];
  bgColor: string;
  slug: string;
}

const TopRatedProductsClient = ({
  heroProduct,
  gridProducts,
  bgColor,
  slug,
}: TopRatedProductsClientProps) => {
  return (
    <section className="py-[70px]">
      <Container>
        <div
          className="rounded-[32px] p-6 lg:p-10"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Hero Product */}
            <motion.div
              className="lg:w-[35%] w-full"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl p-6 h-full flex flex-col items-center text-center justify-between border-2 border-transparent hover:border-primary/20 transition-all shadow-sm hover:shadow-xl group">
                <div className="w-full relative py-6">
                  {heroProduct.discountPercentage > 0 && (
                    <span className="absolute top-0 right-0 bg-warning text-white text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
                      -{heroProduct.discountPercentage}%
                    </span>
                  )}
                  <div className="flex justify-center mb-6 overflow-hidden">
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="max-h-[250px] object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 line-clamp-2">
                    {heroProduct.name}
                  </h3>

                  <div className="flex items-center justify-center gap-x-3 mb-6">
                    <span className="text-2xl font-bold text-primary">
                      $
                      {parseFloat(
                        (
                          heroProduct.price *
                          (1 - (heroProduct.discountPercentage || 0) / 100)
                        ).toFixed(2),
                      )}
                    </span>
                    {heroProduct.discountPercentage > 0 && (
                      <span className="text-lg text-muted-foreground line-through font-medium">
                        ${heroProduct.price}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${heroProduct.slug}`}
                    className="w-full inline-flex justify-center items-center gap-x-2 bg-primary text-primary-foreground font-bold py-3.5 px-6 rounded-full hover:bg-primary-dark transition-all duration-300"
                  >
                    Add To Cart
                    <ChevronRight className="size-5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right Grid Products */}
            <div className="lg:w-[65%] w-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-foreground">
                  Top Rated Products
                </h3>
                <div className="flex gap-2">
                  <button className="size-10 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-foreground shadow-sm">
                    <ChevronRight className="size-5 rotate-180" />
                  </button>
                  <button className="size-10 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-foreground shadow-sm">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {gridProducts.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <ProductCard product={product} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TopRatedProductsClient;
