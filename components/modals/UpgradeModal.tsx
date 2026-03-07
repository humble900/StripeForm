"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentFormCount: number;
  formLimit: number;
  isAuthenticated?: boolean;
}

export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentFormCount,
  formLimit,
  isAuthenticated = false,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="relative bg-blue-600 p-2 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {/* Header text intentionally removed per requirements */}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {/* Current Status */}
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-xs sm:text-sm font-medium text-amber-800">
                Limit Reached
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-700">
              {isAuthenticated
                ? "You have reached your free plan publishing limit. Upgrade to Pro to unlock unlimited forms."
                : "You have reached your free guest publishing limit. Please create an account and upgrade to Pro to unlock unlimited forms."}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">
              Pro Features
            </h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Unlimited forms
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Advanced analytics & insights
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Custom branding & themes
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">
                  Priority support
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700">
                  API access & webhooks
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Pro Plans
              </span>
              <div className="text-right">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  $5/month
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  or $60/year
                </div>
              </div>
            </div>
            {/* Trial note removed per requirements */}
          </div>

          {/* Actions */}
          <div>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-3 text-[11px] sm:text-xs text-gray-500 text-center">
            By upgrading, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
