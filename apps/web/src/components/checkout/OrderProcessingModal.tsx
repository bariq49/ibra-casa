"use client";

import React from "react";
import { Package, ShieldCheck, CreditCard, CheckCircle2, XCircle } from "lucide-react";

export type OrderStep = "preparing" | "securing" | "gateway" | "success" | "error";

interface OrderProcessingModalProps {
  status: {
    step: OrderStep;
    message: string;
  } | null;
}

const OrderProcessingModal = ({ status }: OrderProcessingModalProps) => {
  if (!status) return null;

  const { step, message } = status;

  // Configuration for step UI
  const stepConfig = {
    preparing: {
      icon: <Package className="size-10 text-primary animate-pulse" />,
      color: "border-primary",
      bgRing: "bg-primary/10",
      progress: 25,
    },
    securing: {
      icon: <ShieldCheck className="size-10 text-blue-500 animate-pulse" />,
      color: "border-blue-500",
      bgRing: "bg-blue-500/10",
      progress: 50,
    },
    gateway: {
      icon: <CreditCard className="size-10 text-amber-500 animate-pulse" />,
      color: "border-amber-500",
      bgRing: "bg-amber-500/10",
      progress: 75,
    },
    success: {
      icon: <CheckCircle2 className="size-10 text-emerald-500" />,
      color: "border-emerald-500",
      bgRing: "bg-emerald-500/10",
      progress: 100,
    },
    error: {
      icon: <XCircle className="size-10 text-destructive" />,
      color: "border-destructive",
      bgRing: "bg-destructive/10",
      progress: 100,
    },
  };

  const activeConfig = stepConfig[step];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white p-8 md:p-10 rounded-[24px] flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] transform animate-in zoom-in-95 duration-300 w-[90%] max-w-sm mx-auto text-center border border-border relative overflow-hidden">
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${activeConfig.progress}%` }}
          />
        </div>

        {/* Animated Icon Wrapper */}
        <div className="relative flex items-center justify-center mb-6 mt-2">
          {/* Outer ripples */}
          {step !== "success" && step !== "error" && (
            <>
              <div className={`absolute inset-0 size-24 -m-2 opacity-50 rounded-full animate-ping ${activeConfig.bgRing}`} style={{ animationDuration: '3s' }} />
              <div className={`absolute inset-0 size-20 opacity-70 rounded-full animate-ping ${activeConfig.bgRing}`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            </>
          )}
          
          <div className={`relative flex items-center justify-center size-20 rounded-full border-2 bg-white z-10 transition-colors duration-500 ${activeConfig.color} shadow-lg`}>
            {step === "success" || step === "error" ? (
              <div className="relative">
                {activeConfig.icon}
                <div className={`absolute inset-0 animate-ping opacity-20 rounded-full ${step === "success" ? "bg-emerald-500" : "bg-destructive"}`} />
              </div>
            ) : (
              activeConfig.icon
            )}
            
            {/* Spinning indicator ring for processing states */}
            {step !== "success" && step !== "error" && (
              <svg className="absolute inset-0 size-full animate-spin text-muted-foreground/20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" strokeWidth="2" stroke="currentColor" strokeDasharray="80 200" />
              </svg>
            )}
          </div>
        </div>

        {/* Status Text Area */}
        <div className="flex flex-col gap-3 items-center w-full min-h-[80px] justify-center">
          <h3 className="font-urbanist font-bold text-[22px] text-slate-800 tracking-tight transition-all duration-300">
            {message}
          </h3>
          
          <p className="font-dm-sans text-[14px] text-slate-500 px-4">
            {step === "success" 
              ? "Transitioning you securely now..." 
              : step === "error"
              ? "We encountered an issue holding your reservation."
              : "Please remain on this page while we process your request securely."}
          </p>
        </div>
        
        {/* Step dots */}
        <div className="flex gap-2 mt-8">
          {(["preparing", "securing", "gateway", "success"] as OrderStep[]).map((iterStep) => {
            const isCompleted = stepConfig[iterStep].progress <= activeConfig.progress;
            const isCurrent = iterStep === step;
            return (
               <div 
                 key={iterStep} 
                 className={`h-2 rounded-full transition-all duration-500 ${
                   isCurrent ? "w-6 bg-primary" : isCompleted ? "w-2 bg-primary/40" : "w-2 bg-muted-foreground/20"
                 }`}
               />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderProcessingModal;
