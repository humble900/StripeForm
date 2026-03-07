import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/error-handler";

// POST /api/support-tickets - Create a new support ticket (public endpoint)
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const body = await request.json();
        const {
          userEmail,
          userName,
          subject,
          description,
          category,
          priority,
          tags,
          metadata,
        } = body;

        if (!userEmail || !subject || !description) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Missing required fields: userEmail, subject, description",
            },
            { status: 400 },
          );
        }

        const ticket = await dbService.createSupportTicket({
          userEmail,
          userName,
          subject,
          description,
          category,
          priority,
          tags,
          metadata,
        });

        // Create notification for admins
        await dbService.createNotification({
          type: "ticket_created",
          title: "New Support Ticket",
          message: `New ticket #${ticket.ticketNumber} from ${userEmail}: ${subject}`,
          data: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber },
        });

        return NextResponse.json(
          {
            success: true,
            data: {
              ticketNumber: ticket.ticketNumber,
              id: ticket.id,
              message:
                "Support ticket created successfully. We will get back to you soon.",
            },
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Create support ticket error:", error);
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
