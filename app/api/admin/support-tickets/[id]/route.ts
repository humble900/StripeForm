import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db/service";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import {
  withErrorHandling,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/error-handler";

// Helper function to get admin user from request
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Authentication required");
  }

  return { id: "admin-user", role: "admin" };
}

// GET /api/admin/support-tickets/[id] - Get specific ticket with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request);
        const { id } = await params;

        const ticket = await dbService.getSupportTicketById(id);
        if (!ticket) {
          return NextResponse.json(
            {
              success: false,
              message: "Ticket not found",
            },
            { status: 404 },
          );
        }

        const messages = await dbService.getTicketMessages(id);

        return NextResponse.json({
          success: true,
          data: {
            ticket,
            messages,
          },
        });
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError
        ) {
          return NextResponse.json(
            {
              success: false,
              message: error.message,
            },
            { status: error.statusCode },
          );
        }

        console.error("Get ticket error:", error);
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

// PUT /api/admin/support-tickets/[id] - Update ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    request,
    apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request);
        const { id } = await params;

        const body = await request.json();
        const { status, priority, assignedTo, tags, metadata } = body;

        const updatedTicket = await dbService.updateSupportTicket(id, {
          status,
          priority,
          assignedTo,
          tags,
          metadata,
        });

        if (!updatedTicket) {
          return NextResponse.json(
            {
              success: false,
              message: "Ticket not found",
            },
            { status: 404 },
          );
        }

        // Create notification for ticket updates
        await dbService.createNotification({
          type: "ticket_updated",
          title: "Ticket Updated",
          message: `Ticket #${updatedTicket.ticketNumber} has been updated`,
          data: {
            ticketId: updatedTicket.id,
            ticketNumber: updatedTicket.ticketNumber,
          },
        });

        return NextResponse.json({
          success: true,
          data: updatedTicket,
        });
      } catch (error) {
        if (
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError
        ) {
          return NextResponse.json(
            {
              success: false,
              message: error.message,
            },
            { status: error.statusCode },
          );
        }

        console.error("Update ticket error:", error);
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
