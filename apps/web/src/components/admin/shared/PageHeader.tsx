import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold font-urbanist text-light-primary-text">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-light-secondary-text">{description}</p>
      )}
      {children}
    </div>
  );
}
