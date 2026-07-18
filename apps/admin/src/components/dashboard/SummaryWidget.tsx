import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryWidgetProps {
  title: string;
  value: string | number;
  trend?: number; // percentage e.g. 5.2 or -1.4
  bgColor?: string;
  className?: string;
  /** When true, this widget is not wired to real data — shown faded */
  dimmed?: boolean;
}

export function SummaryWidget({
  title,
  value,
  trend,
  bgColor = "bg-white",
  className,
  dimmed,
}: SummaryWidgetProps) {
  const isPositive = trend && trend >= 0;

  return (
    <div className={cn("flex flex-1 flex-col items-start justify-center p-5 rounded-[16px] overflow-hidden shadow-xs relative", bgColor, className, dimmed && "opacity-60")}>
      <div className="flex gap-1 items-end w-full">
        <div className="flex flex-1 gap-4 items-center">
          <div className="flex flex-1 flex-col gap-1.5 items-start">
              <p className="font-semibold text-sm text-grey-600 leading-[22px]">
                {title}
              </p>
              <p className="font-bold text-[24px] text-grey-900 leading-[36px]">
                {dimmed ? "—" : value}
              </p>
              {dimmed ? (
                <span className="text-[10px] font-semibold text-grey-400 uppercase tracking-wide">N/A in real data</span>
              ) : (
                <span className="text-[10px] font-semibold text-transparent select-none uppercase tracking-wide" aria-hidden="true">-</span>
              )}
            </div>
        </div>
        
        {trend !== undefined && (
          <div className="flex flex-row items-end self-stretch">
            <div className="flex flex-col h-full items-end justify-end">
              <div className="bg-white flex gap-1 items-center px-2 py-1 rounded-[50px] shadow-xs">
                 <p className={cn("font-medium text-[12px] leading-[18px]", isPositive ? "text-primary-main" : "text-error-main")}>
                    {isPositive ? "+" : ""}{trend}%
                 </p>
                 {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-primary-main" /> : <ArrowDownRight className="w-3.5 h-3.5 text-error-main" />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
