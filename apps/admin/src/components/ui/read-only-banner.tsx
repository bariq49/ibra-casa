import { AlertCircle } from "lucide-react";

export const ReadOnlyBanner = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-lighter  border border-warning-lighter  rounded-lg">
      <AlertCircle className="h-4 w-4 text-warning-main  shrink-0" />
      <span className="text-sm text-warning-dark  font-medium">
        Read-only mode: You can view all data but cannot make changes
      </span>
    </div>
  );
};

export const ReadOnlyText = ({ className = "" }: { className?: string }) => {
  return (
    <span className={`text-xs text-muted-foreground px-2 ${className}`}>
      View only
    </span>
  );
};
