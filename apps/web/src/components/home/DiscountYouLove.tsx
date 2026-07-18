"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard, { Product } from "../common/products/ProductCard";

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 4.5,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/vitamin-c.png",
    slug: "product-1",
  },
  {
    id: 2,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 4,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/vitamin-c-2.png",
    slug: "product-2",
  },
  {
    id: 3,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 5,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/bp-machine-2.png",
    slug: "product-3",
  },
  {
    id: 4,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 3.5,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/bp-machine.png",
    slug: "product-4",
  },
  {
    id: 5,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 4.5,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/nutrageinz.png",
    slug: "product-5",
  },
  {
    id: 6,
    title: "VitaLife Omega-3 Softgels Heart Support Max Strength",
    rating: 189,
    stars: 5,
    currentPrice: 27.49,
    oldPrice: 39.99,
    discount: 15,
    image: "/images/vitamin-b12.png",
    slug: "product-6",
  },
];

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

const DiscountYouLove = () => {
  return (
    <section className="pb-[70px]">
      <Container>
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-foreground">
            Discount You Love
          </h3>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              className="w-full"
              variants={itemVariants}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default DiscountYouLove;
