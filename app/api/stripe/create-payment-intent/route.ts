import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createPaymentIntentSchema } from "@/lib/validation/schemas";
import { validateJsonBody } from "@/lib/validation/middleware";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { withErrorHandling, ExternalServiceError } from "@/lib/error-handler";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const validation = await validateJsonBody(
        createPaymentIntentSchema,
        request,
      );

      if (validation instanceof NextResponse) {
        return validation; // Validation failed
      }

      const { amount, currency = "usd", metadata } = validation.data;

      const stripe = new Stripe(env.stripe.secretKey, {
        apiVersion: "2025-08-27.basil",
      });

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: { enabled: true },
          metadata: metadata || {},
        });

        // Log payment intent creation for auditing
        console.log(
          `Payment intent created: ${paymentIntent.id} for amount: ${amount} ${currency}`,
        );

        return NextResponse.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
        });
      } catch (stripeError: any) {
        console.error("Stripe payment intent creation failed:", stripeError);
        throw new ExternalServiceError("Stripe", stripeError.message);
      }
    }),
  );
}
