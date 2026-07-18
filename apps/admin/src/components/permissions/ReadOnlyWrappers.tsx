import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface ReadOnlyWrapperProps {
  children: ReactNode;
  showViewOnlyText?: boolean;
}

/**
 * Wrapper component that conditionally renders children based on CRUD permissions
 * Use this to wrap Add/Edit/Delete buttons that should be hidden for read-only users
 */
export const CRUDActionWrapper = ({ children }: ReadOnlyWrapperProps) => {
  const { canPerformCRUD } = usePermissions();

  if (!canPerformCRUD) return null;

  return <>{children}</>;
};

/**
 * Component that shows "View only" text for read-only users
 */
export const ViewOnlyIndicator = ({
  className = "",
}: {
  className?: string;
}) => {
  const { isReadOnly } = usePermissions();

  if (!isReadOnly) return null;

  return (
    <span className={`text-xs text-muted-foreground px-2 ${className}`}>
      View only
    </span>
  );
};

/**
 * Banner that shows read-only mode notification
 */
export const ReadOnlyModeBanner = () => {
  const { isReadOnly } = usePermissions();

  if (!isReadOnly) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-warning-lighter  border border-warning-lighter  rounded-md">
      <span className="text-xs sm:text-sm text-warning-dark ">
        👁️ Read-only mode: You can view all data but cannot make changes
      </span>
    </div>
  );
};
