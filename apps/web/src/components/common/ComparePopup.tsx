"use client";

import React, { useEffect, useState } from "react";
import { useCompareStore } from "@/store/useCompareStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, X } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ComparePopup() {
  const { isPopupOpen, setPopupOpen, recentAddedProduct } = useCompareStore();
  const [countdown, setCountdown] = useState(5);

  const handleClose = () => {
    setPopupOpen(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isPopupOpen) {
      setCountdown(5);

      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timer = setTimeout(() => {
        handleClose();
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopupOpen]);

  if (!recentAddedProduct) return null;

  const pTitle = recentAddedProduct.title || (recentAddedProduct as any).name;

  return (
    <Dialog open={isPopupOpen} onOpenChange={setPopupOpen}>
      <DialogContent 
        className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-[0px_20px_40px_-4px_rgba(18,25,38,0.12)] rounded-[16px]" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Compare Product Added</DialogTitle>

        <div className="relative p-6 pt-7">
          {/* Custom Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1.5 rounded-full text-light-secondary-text hover:text-primary hover:bg-gray-50 transition-colors focus:outline-none"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-5 text-center mt-2">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <div className="flex flex-col gap-1 w-full px-2">
              <h3 className="font-['Urbanist',sans-serif] font-bold text-xl text-light-primary-text">
                Added to Compare!
              </h3>
              <p className="font-['DM_Sans',sans-serif] text-[15px] text-light-secondary-text leading-relaxed">
                <span className="font-medium text-light-primary-text">{pTitle}</span> has been added to your comparison list.
              </p>
            </div>

            <div className="flex w-full gap-3 mt-4">
              <button
                className="flex-1 font-['DM_Sans',sans-serif] font-semibold text-[14px] h-12 rounded-full border border-light-divider text-light-primary-text hover:bg-gray-50 transition-colors"
                onClick={handleClose}
              >
                Continue ({countdown})
              </button>
              <Link
                href="/compare"
                onClick={handleClose}
                className="flex-1 font-['DM_Sans',sans-serif] font-semibold text-[14px] h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-color-primary"
              >
                View Compare
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
