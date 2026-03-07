import { NextRequest, NextResponse } from "next/server";
import { dbService as db } from "@/lib/db";
import { withErrorHandling } from "@/lib/error-handler";

// GET /api/users/profile - Get user profile
export async function GET(request: NextRequest) {
  return withErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await db.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  })(request);
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  return withErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Updates are required" },
        { status: 400 },
      );
    }

    const updatedUser = await db.updateUser(userId, updates);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  })(request);
}
