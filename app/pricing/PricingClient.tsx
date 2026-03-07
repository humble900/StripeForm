"use client";

import { useState } from "react";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PricingClient() {
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (
    plan: "pro_monthly" | "pro_yearly" = "pro_monthly",
  ) => {
    setLoadingPlan(plan);
    try {
      const envMonthly = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      const envYearly = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;
      const candidate = plan === "pro_yearly" ? envYearly : envMonthly;
      const priceId =
        typeof candidate === "string" && candidate.trim().length > 0
          ? candidate
          : undefined;
      const resp = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan, priceId }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.url)
        throw new Error(data?.error || "Failed to create checkout session");
      window.location.href = data.url;
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isOnFree = !user || user.subscription_tier !== "pro";

  const plans = [
    {
      name: "Freemium",
      planId: "freemium",
      price: "$0",
      period: "Free",
      description: "For guest users and new users",
      features: [
        "Up to 5 published forms",
        "Unlimited drafts",
        "Basic form fields",
        "Form responses",
        "Basic analytics",
        "Mobile responsive",
        "Email support",
      ],
      cta: isOnFree ? "Current Plan" : "Start Free",
      disabled: true,
      ctaAction: () => {},
      popular: false,
      icon: Zap,
    },
    {
      name: "Pro Monthly",
      planId: "pro_monthly",
      price: "$5",
      period: "per month",
      description: "For growing businesses",
      features: [
        "Unlimited form publishing",
        "Advanced form fields",
        "Custom branding",
        "Advanced analytics",
        "Payment integration",
        "Conditional logic",
        "API access",
        "Priority support",
        "Form templates",
        "Data export",
      ],
      cta: "Upgrade to Pro",
      ctaAction: () => handleUpgrade("pro_monthly"),
      popular: true,
      icon: Crown,
    },
    {
      name: "Pro Yearly",
      planId: "pro_yearly",
      price: "$60",
      period: "per year",
      description: "Best value - 2 months free",
      features: [
        "Everything in Pro Monthly",
        "Unlimited form publishing",
        "Advanced form fields",
        "Custom branding",
        "Advanced analytics",
        "Payment integration",
        "Conditional logic",
        "API access",
        "Priority support",
        "Form templates",
        "Data export",
        "2 months free (compared to monthly)",
      ],
      cta: "Upgrade to Pro",
      ctaAction: () => handleUpgrade("pro_yearly"),
      popular: false,
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {isOnFree
              ? "You are currently on the Free plan."
              : "You are on Pro."}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-lg shadow-lg p-4 ${
                  plan.popular
                    ? "ring-2 ring-blue-500"
                    : "hover:shadow-xl transition-shadow"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <div
                      className={`p-2 rounded-full ${
                        plan.popular ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          plan.popular ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3">
                    {plan.description}
                  </p>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1 text-xs">
                      {plan.period}
                    </span>
                  </div>
                  {plan.name === "Freemium" && isOnFree && (
                    <div className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      Current Plan
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.ctaAction}
                  disabled={!!loadingPlan || plan.disabled}
                  className={`w-full py-2 px-3 rounded-md font-semibold transition-all text-xs ${
                    plan.disabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlan === plan.planId ? "Processing..." : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm text-left">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 text-xs">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-left">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                What happens to my forms if I downgrade?
              </h3>
              <p className="text-gray-600 text-xs">
                Your existing forms remain active. You'll need to upgrade again
                to create new published forms beyond the free limit.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-left">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 text-xs">
                We offer a 30-day money-back guarantee for all paid plans. No
                questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-xl font-bold mb-3">
              Ready to create amazing forms?
            </h2>
            <p className="text-base mb-6 opacity-90">
              Join thousands of users who trust StripeForm for their form
              building needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => (window.location.href = "/register")}
                className="bg-white text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors text-xs"
              >
                Start Free Today
              </button>
              <button
                onClick={() => (window.location.href = "/contact")}
                className="border-2 border-white text-white px-5 py-2 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors text-xs"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
