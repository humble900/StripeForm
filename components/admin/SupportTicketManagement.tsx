"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { MessageSquare, RefreshCw, Eye, AlertCircle, Send } from "lucide-react";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  message: string;
  isInternal: boolean;
  attachments: any[];
  createdAt: string;
}

interface SupportTicketManagementProps {
  userRole: "admin" | "super_admin";
}

export function SupportTicketManagement({
  userRole,
}: SupportTicketManagementProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );

  const [ticketFilters, setTicketFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });

  const fetchSupportTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("No admin token found");

      const queryParams = new URLSearchParams();
      if (ticketFilters.status)
        queryParams.append("status", ticketFilters.status);
      if (ticketFilters.priority)
        queryParams.append("priority", ticketFilters.priority);
      if (ticketFilters.category)
        queryParams.append("category", ticketFilters.category);

      const response = await fetch(
        `/api/admin/support-tickets?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, [ticketFilters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-600 mt-1">Manage user issues and inquiries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={ticketFilters.status}
                onChange={(e) =>
                  setTicketFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={ticketFilters.priority}
                onChange={(e) =>
                  setTicketFilters((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={ticketFilters.category}
                onChange={(e) =>
                  setTicketFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tickets ({tickets.length})</CardTitle>
            <Button
              onClick={fetchSupportTickets}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text="Loading tickets..." />
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{ticket.ticketNumber}</span>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View & Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tickets found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => {
            setSelectedTicket(null);
            fetchSupportTickets();
          }}
        />
      )}
    </div>
  );
}

function TicketDetailsModal({
  ticket,
  onClose,
}: {
  ticket: SupportTicket;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(ticket.status);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/support-tickets/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
        setStatus(data.data.ticket.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticket.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`/api/admin/support-tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      setSending(true);
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `/api/admin/support-tickets/${ticket.id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyMessage, isInternal }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setReplyMessage("");
        fetchTicketDetails();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Ticket {ticket.ticketNumber}
                <select
                  value={status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="ml-2 px-2 py-1 text-sm border rounded bg-white shadow-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">{ticket.subject}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-900">
                {ticket.userName || ticket.userEmail}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {loading ? (
            <div className="py-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg shadow-sm border $$'{msg.isInternal ? 'bg-yellow-50 border-yellow-200 ml-12' : 'bg-blue-50 border-blue-200 ml-12'}'}`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    {msg.userName || msg.userEmail}
                    {msg.isInternal && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-yellow-100 text-yellow-800"
                      >
                        Internal Note
                      </Badge>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </CardContent>
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-blue-600"
              />
              Internal Note (Hidden from user)
            </label>
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[80px] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Type your reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <Button
              className="h-auto px-6 whitespace-nowrap"
              onClick={handleSendReply}
              disabled={sending || !replyMessage.trim()}
            >
              <Send
                className={`w-4 h-4 mr-2 $$'{sending ? 'animate-pulse' : ''}'}`}
              />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
