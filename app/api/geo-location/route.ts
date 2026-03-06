import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // In a real application, you might use an IP geolocation service like ip-api.com,
    // MaxMind, or Vercel's built-in geolocation headers to get the user's location.

    // Try to get country and city from Vercel headers if deployed there
    const country = req.headers.get("x-vercel-ip-country");
    const city = req.headers.get("x-vercel-ip-city");
    const region = req.headers.get("x-vercel-ip-country-region");
    const timezone = req.headers.get("x-vercel-ip-timezone");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    // If we have Vercel headers, use them
    if (country) {
        return NextResponse.json({
            country,
            city: city || undefined,
            region: region || undefined,
            timezone: timezone || undefined,
            ip
        });
    }

    // Otherwise, return a generic fallback or unknown location
    // so the frontend doesn't crash with 404s
    return NextResponse.json({
        country: "US", // Default fallback
        city: "Unknown",
        timezone: "UTC",
        ip
    });
}
