import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: Props) => {
  return (
    <div className={cn("w-full max-w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-12", className)}>
      {children}
    </div>
  );
};

export default Container;
