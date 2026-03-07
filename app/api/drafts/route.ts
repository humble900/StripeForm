import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";
import { z } from "zod";

// Validation schemas
const createDraftSchema = z.object({
  formId: z.string().uuid(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  fingerprint: z.string().optional(),
  draftData: z.record(z.any()),
  progressData: z.record(z.any()).optional(),
});

const updateDraftSchema = z.object({
  draftData: z.record(z.any()).optional(),
  progressData: z.record(z.any()).optional(),
});

// Helper function to extract user identification from request
function getUserIdentification(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const sessionId = request.headers.get("x-session-id");
  const fingerprint = request.headers.get("x-fingerprint");

  let userId: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    userId = authHeader.replace("Bearer ", "");
  }

  return {
    userId,
    sessionId: sessionId || undefined,
    fingerprint: fingerprint || undefined,
  };
}

// POST /api/drafts - Create a new draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, fingerprint } = getUserIdentification(request);

    // Validate request body
    const validatedData = createDraftSchema.parse({
      ...body,
      userId: userId || body.userId,
      sessionId: sessionId || body.sessionId,
      fingerprint: fingerprint || body.fingerprint,
    });

    // Check if draft already exists for this user/form combination
    const existingDraft = await dbService.getDraftByFormAndUser(
      validatedData.formId,
      validatedData.userId,
      validatedData.sessionId,
      validatedData.fingerprint,
    );

    let draft;
    if (existingDraft) {
      // Update existing draft
      draft = await dbService.updateDraft(existingDraft.id, {
        draftData: validatedData.draftData,
        progressData: validatedData.progressData,
      });
    } else {
      // Create new draft
      draft = await dbService.createDraft({
        formId: validatedData.formId,
        userId: validatedData.userId,
        sessionId: validatedData.sessionId,
        fingerprint: validatedData.fingerprint,
        draftData: validatedData.draftData,
        progressData: validatedData.progressData,
      });
    }

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error("Error creating/updating draft:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create/update draft" },
      { status: 500 },
    );
  }
}

// GET /api/drafts - Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId, fingerprint } = getUserIdentification(request);
    const url = new URL(request.url);
    const formId = url.searchParams.get("formId");

    if (formId) {
      // Get draft for specific form
      const draft = await dbService.getDraftByFormAndUser(
        formId,
        userId,
        sessionId,
        fingerprint,
      );

      return NextResponse.json({
        success: true,
        data: draft,
      });
    } else if (userId) {
      // Get all user's drafts
      const drafts = await dbService.getUserDrafts(userId);

      return NextResponse.json({
        success: true,
        data: drafts,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "User identification required" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch drafts" },
      { status: 500 },
    );
  }
}
