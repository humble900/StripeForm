import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";
import {
  withRateLimit,
  userFormsRateLimit,
  apiRateLimit,
} from "@/lib/rate-limit";
import { withErrorHandling, AuthenticationError } from "@/lib/error-handler";

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  // Check for cookie-based authentication first
  const cookieToken = request.cookies.get("auth-token")?.value;
  if (cookieToken) {
    // For now, we'll use a simple approach - in production you'd verify the JWT
    try {
      const userData = JSON.parse(cookieToken);
      return { id: userData.userId || userData.id, email: userData.email };
    } catch {
      // Fallback to header-based auth
    }
  }

  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Authentication required");
  }

  const token = authHeader.replace("Bearer ", "");

  // Handle different token formats
  if (token === "anonymous") {
    // For anonymous users, we need to get their fingerprint
    const fingerprint = request.headers.get("x-fingerprint") || "anonymous";
    return { id: fingerprint, email: "anonymous@example.com" };
  }

  // For authenticated users, the token might be their user ID
  return { id: token, email: "user@example.com" };
}

// GET /api/user/forms - Get user's forms
// POST /api/user/forms - Create a new form
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request);
        const body = await request.json();

        // Generate unique slug
        const baseSlug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 50);

        const timestamp = Date.now().toString(36);
        const slug = `${baseSlug}-${timestamp}`;

        // Create the form
        const form = await dbService.createForm({
          ...body,
          slug,
          userId: user.id,
          status: "draft",
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return NextResponse.json(
          {
            success: true,
            data: form,
            message: "Form created successfully",
          },
          { status: 201 },
        );
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            {
              success: false,
              message: error.message,
            },
            { status: error.statusCode },
          );
        }

        console.error("Create form error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Internal server error",
          },
          { status: 500 },
        );
      }
    }),
  );
}

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    userFormsRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        let user: { id: string; email?: string } | null = null;
        try {
          user = await getUserFromRequest(request);
        } catch (authErr) {
          // If unauthenticated, return empty forms array instead of error
          return NextResponse.json({ success: true, data: [] });
        }

        // Check if summary is requested
        const url = new URL(request.url);
        const summary = url.searchParams.get("summary") === "true";

        let forms;
        if (summary) {
          // For summary, get forms without fields and submissions for better performance
          forms = await dbService.getUserFormsSummary(user.id);
        } else {
          // Full forms with fields and submissions
          forms = await dbService.getUserForms(user.id);
        }

        return NextResponse.json({
          success: true,
          data: forms,
        });
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            {
              success: false,
              message: error.message,
            },
            { status: error.statusCode },
          );
        }

        console.error("Get user forms error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Internal server error",
          },
          { status: 500 },
        );
      }
    }),
  );
}
