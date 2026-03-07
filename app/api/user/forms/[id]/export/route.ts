import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { withErrorHandling, AuthenticationError } from "@/lib/error-handler";

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Authentication required");
  }

  const token = authHeader.replace("Bearer ", "");
  return { id: token, email: "user@example.com" };
}

// Helper function to convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header] || "";
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

// GET /api/user/forms/[id]/export - Export form responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request);
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "json";

        // Verify the form belongs to the user
        const form = await dbService.getForm(id);
        if (!form || form.userId !== user.id) {
          return NextResponse.json(
            {
              success: false,
              message: "Form not found or access denied",
            },
            { status: 404 },
          );
        }

        // Get all form responses
        const responses = await dbService.getFormResponses(id);

        if (responses.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "No responses to export",
            },
            { status: 404 },
          );
        }

        if (format === "csv") {
          // Collect all unique field names from responses
          const allFields = new Set<string>();
          allFields.add("Response ID");
          allFields.add("Submitted At");
          allFields.add("User ID");
          allFields.add("IP Address");

          responses.forEach((response) => {
            if (response.data) {
              Object.keys(response.data).forEach((field) =>
                allFields.add(field),
              );
            }
          });

          const headers = Array.from(allFields);

          // Convert responses to CSV format
          const csvData = responses.map((response) => {
            const row: any = {
              "Response ID": response.id,
              "Submitted At": response.submittedAt,
              "User ID": response.userId || "Anonymous",
              "IP Address": response.ipAddress || "Unknown",
            };

            // Add form field data
            if (response.data) {
              Object.entries(response.data).forEach(([field, value]) => {
                row[field] = value;
              });
            }

            return row;
          });

          const csv = convertToCSV(csvData, headers);

          return new NextResponse(csv, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="${form.title}-responses.csv"`,
            },
          });
        } else {
          // JSON export
          const jsonData = {
            form: {
              id: form.id,
              title: form.title,
              description: form.description,
              status: form.status,
              createdAt: form.createdAt,
              updatedAt: form.updatedAt,
            },
            responses: responses.map((response) => ({
              id: response.id,
              submittedAt: response.submittedAt,
              userId: response.userId,
              ipAddress: response.ipAddress,
              userAgent: response.userAgent,
              status: response.status,
              data: response.data,
            })),
            exportedAt: new Date().toISOString(),
            totalResponses: responses.length,
          };

          return new NextResponse(JSON.stringify(jsonData, null, 2), {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": `attachment; filename="${form.title}-responses.json"`,
            },
          });
        }
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

        console.error("Export responses error:", error);
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
