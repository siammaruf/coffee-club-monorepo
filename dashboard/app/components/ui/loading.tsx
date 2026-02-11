import * as React from "react";
import { cn } from "~/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "coffee";
}

export function Loading({
  className,
  size = "md",
  variant = "coffee",
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-10",
    lg: "size-16",
  };

  if (variant === "coffee") {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div className={cn(
          "relative",
          sizeClasses[size]
        )}>
          {/* Coffee cup */}
          <div className="absolute inset-0 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-full text-amber-800"
            >
              <path d="M17 7H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
              <path d="M19 7V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" />
              <path d="M12 12v4" />
              <path d="M8 12v4" />
              <path d="M16 12v4" />
            </svg>
          </div>
          
          {/* Steam animation */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="animate-steam h-2 w-0.5 rounded-full bg-gray-400 opacity-70 delay-100"></div>
              <div className="animate-steam h-3 w-0.5 rounded-full bg-gray-400 opacity-70 delay-300"></div>
              <div className="animate-steam h-2 w-0.5 rounded-full bg-gray-400 opacity-70 delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default spinner variant
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-t-2 border-primary",
          sizeClasses[size]
        )}
      />
    </div>
  );
}