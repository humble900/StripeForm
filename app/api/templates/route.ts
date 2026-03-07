import { NextRequest, NextResponse } from "next/server";
import {
  formTemplates,
  templateCategories,
  getTemplatesByCategory,
  searchTemplates,
} from "@/lib/templates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    let templates = formTemplates;

    // Filter by category
    if (category !== "all") {
      templates = getTemplatesByCategory(category);
    }

    // Search functionality
    if (search) {
      templates = searchTemplates(search);
    }

    // Featured templates only
    if (featured === "true") {
      templates = templates.filter((template) => template.isFeatured);
    }

    return NextResponse.json({
      success: true,
      data: templates,
      categories: templateCategories,
      total: templates.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
