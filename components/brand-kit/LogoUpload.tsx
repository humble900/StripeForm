"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BrandAsset } from "@/types/brand-kit";

interface LogoUploadProps {
  currentAsset?: BrandAsset;
  onUpload: (asset: BrandAsset) => void;
  onRemove?: () => void;
  type: "light" | "dark" | "favicon";
  label: string;
  className?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  currentAsset,
  onUpload,
  onRemove,
  type,
  label,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAsset?.url || null,
  );

  // Safety check for currentAsset
  const safeCurrentAsset =
    currentAsset && typeof currentAsset === "object" ? currentAsset : null;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setError(null);

      try {
        // Validate file type
        const validTypes = [
          "image/svg+xml",
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Invalid file type. Please upload SVG, PNG, JPEG, or WebP files.",
          );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            "File size too large. Please upload files smaller than 5MB.",
          );
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Create asset object
        const asset: BrandAsset = {
          id: `${type}-${Date.now()}`,
          name: `${label} Logo`,
          url: url,
          alt: `${label} logo`,
          width: 0, // Will be set after image loads
          height: 0,
          format: file.type.split("/")[1] as any,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          asset.width = img.width;
          asset.height = img.height;
          onUpload(asset);
          setIsUploading(false);
        };
        img.onerror = () => {
          throw new Error("Failed to load image");
        };
        img.src = url;
      } catch (error) {
        console.error("Upload error:", error);
        setError(error instanceof Error ? error.message : "Upload failed");
        setIsUploading(false);
      }
    },
    [type, label, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".svg", ".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: false,
  });

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    onRemove?.();
  };

  const handlePreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  if (safeCurrentAsset && previewUrl) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Preview logo"
              >
                <EyeIcon className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Remove logo"
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={safeCurrentAsset.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate mb-1">
                {safeCurrentAsset.name}
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {safeCurrentAsset.format.toUpperCase()}
                  </span>
                  <span>
                    {safeCurrentAsset.width}×{safeCurrentAsset.height}
                  </span>
                </div>
                <div>{(safeCurrentAsset.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${
              isDragActive
                ? "border-blue-400 bg-blue-50 scale-[1.02]"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
            ${isUploading ? "pointer-events-none opacity-75" : ""}
          `}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="space-y-2">
              <ArrowPathIcon className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
              <div className="text-sm font-medium text-gray-700">
                Uploading...
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-400" />
              <div className="text-sm font-medium text-gray-900">
                {isDragActive ? "Drop your logo here" : "Upload logo"}
              </div>
              <div className="text-xs text-gray-500">
                SVG, PNG, JPEG, or WebP up to 5MB
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-xs text-red-600">
              <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
