import React from "react";
import { cn } from "@/lib/utils";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface AlertProps {
  variant?: "default" | "destructive" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const Alert = ({ variant = "default", children, className }: AlertProps) => {
  const baseClasses = "rounded-lg border p-4";

  const variantClasses = {
    default: "bg-background text-foreground",
    destructive: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDescription = ({ children, className }: AlertDescriptionProps) => {
  return <div className={cn("text-sm", className)}>{children}</div>;
};

interface AlertIconProps {
  variant?: "default" | "destructive" | "success" | "info";
  className?: string;
}

const AlertIcon = ({ variant = "default", className }: AlertIconProps) => {
  const iconClasses = "h-4 w-4 mr-2";

  switch (variant) {
    case "destructive":
      return (
        <ExclamationTriangleIcon
          className={cn(iconClasses, "text-red-600", className)}
        />
      );
    case "success":
      return (
        <CheckCircleIcon
          className={cn(iconClasses, "text-green-600", className)}
        />
      );
    case "info":
      return (
        <InformationCircleIcon
          className={cn(iconClasses, "text-blue-600", className)}
        />
      );
    default:
      return (
        <InformationCircleIcon
          className={cn(iconClasses, "text-foreground", className)}
        />
      );
  }
};

export { Alert, AlertDescription, AlertIcon };
