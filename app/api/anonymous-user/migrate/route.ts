import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fingerprint, userId } = body;

    if (!fingerprint || !userId) {
      return NextResponse.json(
        { success: false, error: "Fingerprint and user ID are required" },
        { status: 400 },
      );
    }

    await dbService.migrateAnonymousToAuthenticated(fingerprint, userId);

    return NextResponse.json({
      success: true,
      message: "Anonymous user data migrated successfully",
    });
  } catch (error) {
    console.error("Error migrating anonymous user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate anonymous user" },
      { status: 500 },
    );
  }
}
