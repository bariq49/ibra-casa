import { X } from "lucide-react";
import { format } from "date-fns";
import { ApiLogEntry } from "@/lib/api-logger";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SystemMetricsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  log: ApiLogEntry | null;
}

export default function SystemMetricsSidebar({ isOpen, onClose, log }: SystemMetricsSidebarProps) {
  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-[400px] sm:w-[540px] p-0 border-l border-neutral-100 bg-grey-100 sm:max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-6 bg-white border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold font-heading text-neutral-800">
              API Log Details
            </h2>
            <p className="text-sm font-medium text-neutral-500 mt-1">
              {format(new Date(log.createdAt), "MMM d, yyyy - HH:mm:ss.SSS")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <span className={cn(
                  "inline-flex items-center justify-center px-3 py-1.5 rounded-[8px] text-sm font-bold",
                  log.method === "GET" && "bg-[#EBF5FF] text-[#3B82F6]",
                  log.method === "POST" && "bg-[#E6F4EA] text-[#34A853]",
                  log.method === "PUT" && "bg-[#FEF7E0] text-[#FBBC04]",
                  log.method === "DELETE" && "bg-error-lighter text-error-main",
                  log.method === "PATCH" && "bg-[#F3E8FF] text-[#A855F7]"
                )}>
                  {log.method}
                </span>

                <span className={cn(
                  "flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-[8px]",
                  log.statusCode >= 200 && log.statusCode < 300 ? "bg-success-lighter text-success-main" :
                  log.statusCode >= 400 ? "bg-error-lighter text-error-main" : "bg-warning-lighter text-warning-main"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    log.statusCode >= 200 && log.statusCode < 300 ? "bg-success-main" :
                    log.statusCode >= 400 ? "bg-error-main" : "bg-warning-main"
                  )} />
                  {log.statusCode}
                </span>

                <span className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-[8px] text-sm font-bold flex items-center gap-1">
                  <span>{log.responseTimeMs}</span>
                  <span className="text-neutral-400 text-xs">ms</span>
                </span>
             </div>

             <div className="flex flex-col gap-1.5">
               <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Endpoint URL</span>
               <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 break-all font-mono text-sm text-neutral-700">
                 {log.originalUrl}
               </div>
             </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
             <h3 className="text-sm uppercase tracking-wider font-semibold text-neutral-400 mb-4">Request Origin</h3>
             <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[13px] text-neutral-500 mb-1">Source Interface</span>
                  <span className="font-medium text-neutral-800 flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      log.source === "admin" ? "bg-primary-main" : "bg-secondary-main"
                    )} />
                    {log.source === "admin" ? "Admin Dashboard" : "User Storefront"}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[13px] text-neutral-500 mb-1">Log ID</span>
                  <span className="font-mono text-sm text-neutral-700 bg-neutral-50 px-2 py-1 flex w-max rounded-lg border border-neutral-100">
                    {log._id}
                  </span>
                </div>
             </div>
          </div>

          {log.errorObj && (
             <div className="rounded-2xl overflow-hidden border border-error-main/30 shadow-sm">
               {/* Red header band */}
               <div className="bg-error-main px-5 py-3.5 flex items-center gap-2">
                 <div className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                   </svg>
                 </div>
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Error Details</h3>
               </div>
               {/* White body — code output */}
               <div className="bg-[#1a1a1a] p-4 overflow-auto max-h-[300px]">
                 <pre className="font-mono text-xs text-[#ff8a8a] leading-relaxed whitespace-pre-wrap break-all">
                   {JSON.stringify(log.errorObj, null, 2)}
                 </pre>
               </div>
             </div>
          )}


        </div>
      </SheetContent>
    </Sheet>
  );
}
