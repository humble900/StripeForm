"use client";

import { Crown, ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface FormLimitMessageProps {
  currentFormCount: number;
  formLimit: number;
  onUpgrade: () => void;
  onDismiss?: () => void;
  isAuthenticated?: boolean;
}

export function FormLimitMessage({
  currentFormCount,
  formLimit,
  onUpgrade,
  onDismiss,
  isAuthenticated = false,
}: FormLimitMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-amber-800">
                {isAuthenticated
                  ? "Free Plan Limit Reached"
                  : "Guest User Limit Reached"}
              </h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {currentFormCount}/{formLimit} forms
              </span>
            </div>

            <p className="text-sm text-amber-700 mb-3">
              {isAuthenticated
                ? `You've published ${currentFormCount} forms on your free plan. You can still create and save drafts, but to publish more forms, upgrade to Pro for unlimited publishing.`
                : `You've published ${currentFormCount} forms as a guest user. Create an account and upgrade to Pro to continue publishing more forms.`}
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={onUpgrade}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {isAuthenticated ? "Upgrade to Pro" : "Sign Up & Upgrade"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs text-amber-600">
                $5/month • 14-day free trial
              </span>
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
