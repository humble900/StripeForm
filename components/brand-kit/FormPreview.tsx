"use client";

import { useBrandKit } from "@/components/providers/BrandKitProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormPreview = () => {
  const { brandKit } = useBrandKit();

  if (!brandKit) {
    return <div className="w-full">Loading...</div>;
  }

  // Get form width from brand kit settings
  const getFormWidth = () => {
    const width = brandKit.formStyling?.layout?.width || "medium";
    switch (width) {
      case "small":
        return "max-w-sm";
      case "medium":
        return "max-w-md";
      case "large":
        return "max-w-2xl";
      case "full":
        return "w-full max-w-none";
      case "custom":
        return "";
      default:
        return "max-w-md";
    }
  };

  const getCustomWidth = () => {
    if (brandKit.formStyling?.layout?.width === "custom") {
      return { maxWidth: brandKit.formStyling?.layout?.maxWidth || "768px" };
    }
    return {};
  };

  return (
    <div className={`mx-auto ${getFormWidth()}`} style={getCustomWidth()}>
      {/* Header with Logo */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {brandKit.customTextLogo?.text ? (
            // Show custom text logo if it exists
            <div
              className="font-bold"
              style={{
                color: brandKit.customTextLogo.color || "#3b82f6",
                fontFamily: brandKit.customTextLogo.fontFamily || "Inter",
                fontSize:
                  brandKit.customTextLogo.fontSize === "sm"
                    ? "0.875rem"
                    : brandKit.customTextLogo.fontSize === "base"
                      ? "1rem"
                      : brandKit.customTextLogo.fontSize === "lg"
                        ? "1.125rem"
                        : brandKit.customTextLogo.fontSize === "xl"
                          ? "1.25rem"
                          : brandKit.customTextLogo.fontSize === "2xl"
                            ? "1.5rem"
                            : brandKit.customTextLogo.fontSize === "3xl"
                              ? "1.875rem"
                              : brandKit.customTextLogo.fontSize === "4xl"
                                ? "2.25rem"
                                : "1.5rem",
                fontWeight: brandKit.customTextLogo.fontWeight || "bold",
                textTransform: brandKit.customTextLogo.textTransform || "none",
              }}
            >
              {brandKit.customTextLogo.text}
            </div>
          ) : brandKit.logo?.current ? (
            brandKit.logo.current.type === "text" ? (
              <div
                className="text-2xl font-bold"
                style={{
                  color:
                    brandKit.logo.current.color ||
                    brandKit.colors?.buttonPrimary?.hex ||
                    "#3b82f6",
                  fontFamily:
                    brandKit.logo.current.fontFamily ||
                    brandKit.typography?.fontFamily?.primary ||
                    "Inter",
                  fontSize: brandKit.logo.current.fontSize || "1.5rem",
                  fontWeight: brandKit.logo.current.fontWeight || "700",
                  textTransform: brandKit.logo.current.textTransform || "none",
                }}
              >
                {brandKit.logo.current.text || "Stripeform"}
              </div>
            ) : (
              <img
                src={
                  typeof brandKit.logo.current.file === "string"
                    ? brandKit.logo.current.file
                    : "/logo-placeholder.png"
                }
                alt="Brand Logo"
                className="h-12 w-auto"
              />
            )
          ) : (
            // Default Stripeform logo when no custom logo is set
            <div className="text-2xl font-bold text-blue-600">Stripeform</div>
          )}
        </div>

        <div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Contact Us
          </h1>
          <p
            className="text-gray-600"
            style={{
              color: brandKit.colors?.text?.secondary?.hex || "#64748b",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Get in touch with our team
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Name
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            className="w-full"
            style={{
              padding: brandKit.formStyling?.input?.padding || "0.75rem",
              borderRadius:
                brandKit.formStyling?.input?.borderRadius || "0.5rem",
              borderWidth: brandKit.formStyling?.input?.borderWidth || "1px",
              fontSize: brandKit.typography?.fontSize?.base || "1rem",
              borderColor: brandKit.colors?.border?.primary?.hex || "#e2e8f0",
              backgroundColor:
                brandKit.colors?.fieldBackground?.hex || "#ffffff",
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Email Address
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full"
            style={{
              padding: brandKit.formStyling?.input?.padding || "0.75rem",
              borderRadius:
                brandKit.formStyling?.input?.borderRadius || "0.5rem",
              borderWidth: brandKit.formStyling?.input?.borderWidth || "1px",
              fontSize: brandKit.typography?.fontSize?.base || "1rem",
              borderColor: brandKit.colors?.border?.primary?.hex || "#e2e8f0",
              backgroundColor:
                brandKit.colors?.fieldBackground?.hex || "#ffffff",
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Subject
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Inquiry</SelectItem>
              <SelectItem value="support">Technical Support</SelectItem>
              <SelectItem value="billing">Billing Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          >
            Message
          </label>
          <textarea
            placeholder="Enter your message"
            rows={4}
            className="w-full border rounded-md resize-none"
            style={{
              padding: brandKit.formStyling?.input?.padding || "0.75rem",
              borderRadius:
                brandKit.formStyling?.input?.borderRadius || "0.5rem",
              borderWidth: brandKit.formStyling?.input?.borderWidth || "1px",
              fontSize: brandKit.typography?.fontSize?.base || "1rem",
              borderColor: brandKit.colors?.border?.primary?.hex || "#e2e8f0",
              backgroundColor:
                brandKit.colors?.fieldBackground?.hex || "#ffffff",
              color: brandKit.colors?.text?.primary?.hex || "#0f172a",
              fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          className="w-full"
          style={{
            padding:
              brandKit.formStyling?.button?.primary?.padding ||
              "0.75rem 1.5rem",
            borderRadius:
              brandKit.formStyling?.button?.primary?.borderRadius || "0.5rem",
            fontSize: brandKit.typography?.fontSize?.base || "1rem",
            fontWeight:
              brandKit.formStyling?.button?.primary?.fontWeight || "600",
            backgroundColor: brandKit.colors?.buttonPrimary?.hex || "#3b82f6",
            color: "#ffffff",
            fontFamily: brandKit.typography?.fontFamily?.primary || "Inter",
          }}
        >
          Send Message
        </Button>
      </div>
    </div>
  );
};

export default FormPreview;
