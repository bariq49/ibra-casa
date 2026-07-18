import { Sparkles } from "lucide-react";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-background rounded-2xl border border-border p-10 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary-lighter text-primary-dark flex items-center justify-center mb-5">
        <Sparkles size={26} />
      </div>
      <h2 className="text-xl font-bold text-grey-900 mb-2">{title}</h2>
      <p className="text-sm text-grey-600 max-w-md">
        {description ||
          "This section of the seller portal is on the way. We'll have it ready in the next release."}
      </p>
    </div>
  );
}
