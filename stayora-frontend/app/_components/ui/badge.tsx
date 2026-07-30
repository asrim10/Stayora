import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        variant === "default"
          ? "border border-gray-200 bg-gray-100 text-gray-800"
          : variant === "success"
            ? "border border-green-200 bg-green-100 text-green-800"
            : variant === "warning"
              ? "border border-yellow-200 bg-yellow-100 text-yellow-800"
              : variant === "destructive"
                ? "border border-red-200 bg-red-100 text-red-800"
                : ""
      } ${className}`}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
