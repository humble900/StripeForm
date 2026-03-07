import { NextRequest, NextResponse } from "next/server";
import { dbService as db } from "@/lib/db";
import { getFormsSchema, createFormSchema } from "@/lib/validation/schemas";
import {
  validateSearchParams,
  validateJsonBody,
} from "@/lib/validation/middleware";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { withErrorHandling, NotFoundError } from "@/lib/error-handler";
import { formCache, invalidateFormCache } from "@/lib/cache";

// GET /api/forms - Get forms for a user
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const validation = validateSearchParams(getFormsSchema, searchParams);

      if (validation instanceof NextResponse) {
        return validation; // Validation failed
      }

      const { userId, limit = 50, offset = 0, status } = validation.data;

      // Check cache first
      const cacheKey = `user-forms:${userId}:${status || "all"}:${limit}:${offset}`;
      const cached = formCache.get(cacheKey);

      if (cached) {
        return NextResponse.json(cached);
      }

      const forms = await db.getUserForms(userId);

      // Filter by status if provided
      const filteredForms = status
        ? forms.filter((form) => form.status === status)
        : forms;

      // Apply pagination manually
      const paginatedForms = filteredForms.slice(offset, offset + limit);

      const response = {
        success: true,
        forms: paginatedForms,
        pagination: {
          limit,
          offset,
          total: filteredForms.length,
          hasMore: offset + limit < filteredForms.length,
        },
      };

      // Cache the response for 5 minutes
      formCache.set(cacheKey, response, 5 * 60 * 1000);

      return NextResponse.json(response);
    }),
  );
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const validation = await validateJsonBody(createFormSchema, request);

      if (validation instanceof NextResponse) {
        return validation; // Validation failed
      }

      const { title, description, fields, settings, userId } = validation.data;

      // Check form limit for anonymous users
      if (userId.length <= 20) {
        // Anonymous fingerprint (shorter than Firebase UID)
        const formLimitData = await db.canAnonymousUserCreateForm(userId);
        if (!formLimitData.canCreate) {
          return NextResponse.json(
            {
              error: "Form limit reached",
              message:
                "You have reached the maximum number of forms. Please sign in to create more forms.",
              code: "FORM_LIMIT_EXCEEDED",
            },
            { status: 403 },
          );
        }
      }

      // Generate unique slug
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);

      const timestamp = Date.now().toString(36);
      const slug = `${baseSlug}-${timestamp}`;

      // Create the form (including fields if provided)
      const form = await db.createForm({
        title,
        description: description || "",
        slug,
        userId: userId,
        status: "draft",
        isPublic: false,
        allowAnonymous: settings?.allowAnonymous ?? true,
        requireCaptcha: settings?.requireCaptcha ?? false,
        maxSubmissions: settings?.maxSubmissions || null,
        submissionLimit: settings?.submissionLimit || null,
        settings: settings || {},
        fields: fields || [],
      });

      // Invalidate related caches
      invalidateFormCache(form.id);

      return NextResponse.json(
        {
          success: true,
          data: form,
          message: "Form created successfully",
        },
        { status: 201 },
      );
    }),
  );
}
