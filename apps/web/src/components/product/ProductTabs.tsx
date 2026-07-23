"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FullProduct } from "@/hooks/useProductBySlug";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
type TabId = "description" | "additional" | "faqs";

function ProductFaqRow({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[rgba(145,158,171,0.24)] last:border-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
      >
        <h4 className="text-[16px] font-semibold font-dm-sans text-foreground group-hover:text-primary transition-colors pr-8">
          {question}
        </h4>
        <div className="shrink-0 size-6 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
        </div>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out font-dm-sans text-light-secondary-text text-[16px] leading-6",
          isOpen ? "max-h-[500px] pb-4 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <p className="pt-1 whitespace-pre-wrap">{answer}</p>
      </div>
    </div>
  );
}

// ─── Checkmark Circle SVG (matches Figma checkmark-circle-01, 24×24) ─────────
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className || "shrink-0"}
    >
      <circle cx="12" cy="12" r="12" className="fill-primary" />
      <path
        d="M7.5 12.5L10.5 15.5L16.5 9"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Bullet Point Row (matches Figma "Point" frame) ──────────────────────────
function BulletPoint({ html }: { html: string }) {
  // Strip outer <p> since it's already block level and causes weird spacing
  const cleanHtml = html.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
  return (
    <div className="flex items-start gap-4">
      <CheckCircleIcon className="mt-0.5 shrink-0" />
      <div
        className="font-dm-sans font-normal text-[16px] text-light-secondary-text leading-6 flex-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline"
        style={{ fontVariationSettings: "'opsz' 14" }}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}

// ─── HTML Entity Decoder ──────────────────────────────────────────────────────
// Decodes HTML entities to ensure proper rendering (consistent server/client)
function decodeHtmlEntities(html: string): string {
  // Use regex for both server and client to ensure consistent hydration
  return html
    .replace(/\\"/g, '"') // Unescape backslash-escaped quotes first
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

// ─── HTML → Typed Content Nodes ──────────────────────────────────────────────
// Parses rich-text HTML (from Quill/ReactQuill) into a typed node list
// that maps 1-to-1 to Figma content blocks.
type ContentNode =
  | {
      type: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
      html: string;
    }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "img"; src: string; alt: string };

function parseHtmlToNodes(htmlStr: string): ContentNode[] {
  if (!htmlStr) return [];

  // Decode HTML entities first
  const decodedHtml = decodeHtmlEntities(htmlStr);

  const nodes: ContentNode[] = [];

  // Remove empty paragraphs with only whitespace or &nbsp;
  const cleanedHtml = decodedHtml
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<p>&nbsp;<\/p>/gi, "")
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "");

  // Sequential parser - process tags in order they appear
  let remaining = cleanedHtml;
  let safetyCounter = 0;
  const MAX_ITERATIONS = 1000;

  while (remaining.trim() && safetyCounter++ < MAX_ITERATIONS) {
    remaining = remaining.trim();
    let matched = false;

    // Try to match standalone image tag (most common in Quill)
    const imgPattern = /^<img\s+([^>]+?)>/i;
    const imgMatch = remaining.match(imgPattern);
    if (imgMatch) {
      const attrs = imgMatch[1];
      // More flexible src pattern to handle various quote formats
      const srcM = attrs.match(/src\s*=\s*["\']?([^"'\s>]+)["\']?/i);
      const altM = attrs.match(/alt\s*=\s*["']([^"']*)["']/i);

      if (srcM?.[1]) {
        nodes.push({
          type: "img",
          src: srcM[1],
          alt: altM?.[1] || "",
        });
      }

      remaining = remaining.slice(imgMatch[0].length);
      matched = true;
      continue;
    }

    // Try to match paragraph
    const pPattern = /^<p(?:\s+[^>]*)?>([\s\S]+?)<\/p>/i;
    const pMatch = remaining.match(pPattern);
    if (pMatch) {
      const inner = pMatch[1];

      // Check if paragraph contains images
      const innerImgPattern = /<img\s+([^>]+?)>/gi;
      let imgInnerMatch;
      while ((imgInnerMatch = innerImgPattern.exec(inner)) !== null) {
        const attrs = imgInnerMatch[1];
        // More flexible src pattern to handle various quote formats
        const srcM = attrs.match(/src\s*=\s*["\']?([^"'\s>]+)["\']?/i);
        const altM = attrs.match(/alt\s*=\s*["']([^"']*)["']/i);

        if (srcM?.[1]) {
          nodes.push({
            type: "img",
            src: srcM[1],
            alt: altM?.[1] || "",
          });
        }
      }

      // Extract text without images
      const textOnly = inner.replace(/<img[^>]+>/gi, "").trim();
      const hasRealContent =
        textOnly &&
        textOnly !== "&nbsp;" &&
        textOnly.replace(/&nbsp;|\s/g, "").length > 0;

      if (hasRealContent) {
        nodes.push({ type: "p", html: textOnly });
      }

      remaining = remaining.slice(pMatch[0].length);
      matched = true;
      continue;
    }

    // Try to match headings
    const headingPattern = /^<(h[1-6])(?:\s+[^>]*)?>([\s\S]+?)<\/\1>/i;
    const headingMatch = remaining.match(headingPattern);
    if (headingMatch) {
      const tag = headingMatch[1].toLowerCase();
      const content = headingMatch[2].trim();
      const hasContent =
        content &&
        content !== "&nbsp;" &&
        content.replace(/&nbsp;|\s/g, "").length > 0;

      if (hasContent) {
        nodes.push({
          type: tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
          html: content,
        });
      }

      remaining = remaining.slice(headingMatch[0].length);
      matched = true;
      continue;
    }

    // Try to match lists
    const listPattern = /^<(ul|ol)(?:\s+[^>]*)?>([\s\S]+?)<\/\1>/i;
    const listMatch = remaining.match(listPattern);
    if (listMatch) {
      const listType = listMatch[1].toLowerCase() as "ul" | "ol";
      const inner = listMatch[2];

      const items: string[] = [];
      const liPattern = /<li(?:\s+[^>]*)?>([\s\S]+?)<\/li>/gi;
      let liMatch;

      while ((liMatch = liPattern.exec(inner)) !== null) {
        const itemContent = liMatch[1].trim();
        const hasContent =
          itemContent &&
          itemContent !== "&nbsp;" &&
          itemContent.replace(/&nbsp;|\s/g, "").length > 0;

        if (hasContent) {
          items.push(itemContent);
        }
      }

      if (items.length > 0) {
        nodes.push({ type: listType, items });
      }

      remaining = remaining.slice(listMatch[0].length);
      matched = true;
      continue;
    }

    // Try to match blockquote
    const blockquotePattern =
      /^<blockquote(?:\s+[^>]*)?>([\s\S]+?)<\/blockquote>/i;
    const blockquoteMatch = remaining.match(blockquotePattern);
    if (blockquoteMatch) {
      const content = blockquoteMatch[1].trim();
      const hasContent =
        content &&
        content !== "&nbsp;" &&
        content.replace(/&nbsp;|\s/g, "").length > 0;

      if (hasContent) {
        nodes.push({ type: "blockquote", html: content });
      }

      remaining = remaining.slice(blockquoteMatch[0].length);
      matched = true;
      continue;
    }

    // If nothing matched, skip one character to avoid infinite loop
    if (!matched) {
      remaining = remaining.slice(1);
    }
  }

  return nodes;
}

export default function ProductTabs({ product }: { product: FullProduct }) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const hasDescription =
    product.description &&
    product.description.replace(/<[^>]*>/g, "").trim().length > 0;

  // Check if description contains HTML tags (rich text) or is plain text
  const isRichTextDescription =
    product.description && /<[^>]+>/.test(product.description);

  const productFaqs = (product.faqs || []).filter(
    (f) => f.question?.trim() && f.answer?.trim(),
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "description", label: "Description" },
    { id: "additional", label: "Additional information" },
    ...(productFaqs.length > 0
      ? [{ id: "faqs" as const, label: "FAQs", count: productFaqs.length }]
      : []),
  ];

  // Build additional info rows from product fields
  const additionalInfoRows: { label: string; value: string }[] = [
    ...(product.category?.name
      ? [{ label: "Category", value: product.category.name }]
      : []),
    ...(product.categories?.length > 0
      ? [
          {
            label: "Categories",
            value: product.categories.map((c) => c.name).join(", "),
          },
        ]
      : []),
    ...(product.colors?.length > 0
      ? [
          {
            label: "Available Colors",
            value: product.colors.map((c) => c.name).join(", "),
          },
        ]
      : []),
    ...(product.sizes?.length > 0
      ? [
          {
            label: "Available Sizes",
            value: product.sizes.map((s) => s.name).join(", "),
          },
        ]
      : []),
    {
      label: "In Stock",
      value: product.stock > 0 ? `${product.stock} units` : "Out of stock",
    },
    {
      label: "Rating",
      value: `${product.averageRating?.toFixed(1) || "0.0"} / 5 (${product.numReviews} reviews)`,
    },
  ].filter((r) => r.value);

  // Build nodes for the description layout and split by image instances
  // Only parse if it's rich text (HTML)
  const parsedNodes = React.useMemo(() => {
    if (!isRichTextDescription) return [];

    const nodes = parseHtmlToNodes(product.description || "");
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      nodes
        .filter((n) => n.type === "img")
        .forEach((img, idx) => {
          console.log(`Image ${idx + 1} src:`, img.src);
        });
    }
    return nodes;
  }, [product.description, isRichTextDescription]);

  const topNodes: ContentNode[] = [];
  let bannerImg: (ContentNode & { type: "img" }) | null = null;
  const leftNodes: ContentNode[] = [];
  let sideImg: (ContentNode & { type: "img" }) | null = null;
  const bottomNodes: ContentNode[] = [];

  let stage = 0;
  for (const node of parsedNodes) {
    if (node.type === "img") {
      if (stage === 0) {
        bannerImg = node as ContentNode & { type: "img" };
        stage = 1;
      } else if (stage === 1) {
        sideImg = node as ContentNode & { type: "img" };
        stage = 2;
      } else {
        bottomNodes.push(node);
      }
    } else {
      if (stage === 0) topNodes.push(node);
      else if (stage === 1) leftNodes.push(node);
      else bottomNodes.push(node);
    }
  }

  // Generic node renderer preserving inline styles and flex layouts
  const renderNode = (
    node: ContentNode,
    i: number,
    place: "top" | "side" | "bottom",
  ) => {
    if (node.type === "p") {
      return (
        <div
          key={i}
          className="font-dm-sans font-normal text-[16px] text-light-secondary-text leading-6 wrap-break-word whitespace-pre-wrap w-full max-w-full [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline"
          style={{ fontVariationSettings: "'opsz' 14" }}
          dangerouslySetInnerHTML={{ __html: node.html }}
        />
      );
    }
    if (node.type.match(/^h[1-6]$/)) {
      return (
        <div key={i} className="flex flex-col">
          <h3
            className="font-Urbanist font-bold text-[24px] text-light-primary-text leading-9 mt-4 mb-2 wrap-break-word max-w-full"
            dangerouslySetInnerHTML={{ __html: (node as any).html }}
          />
        </div>
      );
    }
    if (node.type === "ul" || node.type === "ol") {
      const isTop = place === "top";
      const gridClass = isTop
        ? "grid grid-cols-1 min-[1440px]:grid-cols-2 gap-x-6 min-[1440px]:gap-x-[72px] gap-y-6"
        : "grid grid-cols-1 gap-y-6";

      return (
        <div key={i} className={`${gridClass} w-full max-w-full my-4`}>
          {node.items.map((itemHtml, idx) => (
            <BulletPoint key={idx} html={itemHtml} />
          ))}
        </div>
      );
    }
    if (node.type === "img") {
      return (
        <div
          key={i}
          className="w-full relative rounded-3xl overflow-hidden bg-gray-50 my-6 flex items-center justify-center"
        >
          <Image
            src={node.src}
            alt={node.alt || product.name}
            width={1080}
            height={800}
            className="w-full h-auto max-h-[min(720px,80vh)] object-contain rounded-3xl"
            loading="lazy"
            onError={(e) => {
              console.error("Failed to load image:", node.src);
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      );
    }
    if (node.type === "blockquote") {
      return (
        <blockquote
          key={i}
          className="border-l-4 border-primary pl-4 py-1 my-4 italic text-light-secondary-text font-dm-sans wrap-break-word w-full"
          dangerouslySetInnerHTML={{ __html: node.html }}
        />
      );
    }
    return null;
  };

  return (
    <div className="py-12">
      {/* ─── Tab Toggle Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`md:px-8 md:py-3 px-4 py-2 rounded-full text-base font-medium font-dm-sans transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-light-primary-text hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── DESCRIPTION TAB ── */}
        {activeTab === "description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full border border-border rounded-xl overflow-hidden bg-white"
          >
            {/* Title bar */}
            <div className="bg-gray-200 px-6 py-4 border-b border-border">
              <h2 className="font-Urbanist font-bold text-[20px] text-foreground leading-7.5">
                Descriptions
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-8 flex flex-col items-start w-full overflow-hidden">
              {hasDescription ? (
                isRichTextDescription ? (
                  <div className="flex flex-col gap-6 w-full max-w-full">
                    {/* TOP SECTION (Paragraphs + first list) */}
                    {topNodes.map((node, i) => renderNode(node, i, "top"))}

                    {/* FIRST IMAGE: Full-width banner */}
                    {bannerImg && (
                      <div className="w-full relative rounded-3xl overflow-hidden bg-gray-50 my-2 flex items-center justify-center">
                        <Image
                          src={bannerImg.src}
                          alt={bannerImg.alt || product.name}
                          width={1080}
                          height={800}
                          className="w-full h-auto max-h-[min(720px,80vh)] object-contain rounded-3xl"
                          loading="lazy"
                          onError={(e) => {
                            console.error(
                              "Failed to load banner image:",
                              bannerImg.src,
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* SIDE BY SIDE SECTION (Left text/lists, Right image) */}
                    {(leftNodes.length > 0 || sideImg) && (
                      <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start w-full my-4">
                        {/* Left Side: Headings, Texts, Next List */}
                        <div className="flex-1 flex flex-col gap-6 min-w-0 justify-center w-full">
                          {leftNodes.map((node, i) =>
                            renderNode(node, i, "side"),
                          )}
                        </div>

                        {/* Right Side: Secondary Image */}
                        {sideImg && (
                          <div className="w-full xl:w-160 shrink-0 relative rounded-3xl overflow-hidden bg-gray-50 mt-4 xl:mt-0 flex items-center justify-center">
                            <Image
                              src={sideImg.src}
                              alt={sideImg.alt || `${product.name} detail`}
                              className="w-full h-auto max-h-[min(640px,70vh)] object-contain rounded-3xl"
                              loading="lazy"
                              width={1440}
                              height={1000}
                              onError={(e) => {
                                console.error(
                                  "Failed to load side image:",
                                  sideImg.src,
                                );
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOTTOM SECTION (Any remaining stuff) */}
                    {bottomNodes.map((node, i) =>
                      renderNode(node, i, "bottom"),
                    )}
                  </div>
                ) : (
                  // Plain text description fallback
                  <div className="w-full">
                    <p className="font-dm-sans font-normal text-[16px] text-light-secondary-text leading-6 whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-muted-foreground font-dm-sans">
                  No description available for this product.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ADDITIONAL INFORMATION TAB ── */}
        {activeTab === "additional" && (
          <motion.div
            key="additional"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full border border-border rounded-xl overflow-hidden bg-white"
          >
            {/* Title bar */}
            <div className="bg-gray-200 px-6 py-4 border-b border-border">
              <h2 className="font-Urbanist font-bold text-[20px] text-foreground leading-7.5">
                Additional information
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              {additionalInfoRows.length > 0 ? (
                <div className="flex flex-col gap-0">
                  {additionalInfoRows.map((row, idx) => (
                    <React.Fragment key={row.label}>
                      <div className="flex items-center gap-4 py-3.5">
                        <span className="font-dm-sans font-semibold text-[16px] text-foreground w-40 sm:w-50 shrink-0 leading-6">
                          {row.label}
                        </span>
                        <span className="font-dm-sans font-normal text-[16px] text-light-secondary-text leading-6 flex-1">
                          {row.value}
                        </span>
                      </div>
                      {idx < additionalInfoRows.length - 1 && (
                        <div className="h-px w-full bg-[rgba(145,158,171,0.24)]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground font-dm-sans">
                  No additional information available.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── FAQS TAB ── */}
        {activeTab === "faqs" && productFaqs.length > 0 && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full border border-border rounded-xl overflow-hidden bg-white"
          >
            <div className="bg-gray-200 px-6 py-4 border-b border-border">
              <h2 className="font-Urbanist font-bold text-[20px] text-foreground leading-7.5">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              {productFaqs.map((faq, index) => (
                <ProductFaqRow
                  key={`${faq.question}-${index}`}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaqIndex === index}
                  onClick={() =>
                    setOpenFaqIndex((prev) => (prev === index ? null : index))
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
