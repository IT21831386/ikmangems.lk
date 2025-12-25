/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, Bell } from "lucide-react";

const API_BASE = "http://localhost:5001/api";

function TicketList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [seenCounts, setSeenCounts] = useState({}); // { [ticketId]: number }
  const [notifications, setNotifications] = useState([]); // Array of notification objects

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await axios.get(`${API_BASE}/tickets`, {
          params: email ? { email } : {},
        });
        let allTickets = res.data.tickets || [];

        // If we returned from an edit, replace the ticket in-place
        if (location.state?.isEdit && location.state?.updatedTicket) {
          const u = location.state.updatedTicket;
          allTickets = allTickets.map((t) => (t._id === u._id ? u : t));
        } else if (location.state?.newTicket) {
          // Freshly created ticket: prepend so it appears immediately
          allTickets = [location.state.newTicket, ...allTickets];
        }

        setTickets(allTickets);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    // Load seen counts from storage
    try {
      const stored = localStorage.getItem("ticketSeenResponseCounts");
      if (stored) setSeenCounts(JSON.parse(stored));
    } catch {}

    fetchTickets();
  }, [location.state]);

  const getUnseenCount = (ticket) => {
    const total = Array.isArray(ticket.responses) ? ticket.responses.length : 0;
    const seen = seenCounts[ticket._id] || 0;
    return Math.max(0, total - seen);
  };

  const markResponsesSeen = (ticket) => {
    const total = Array.isArray(ticket.responses) ? ticket.responses.length : 0;
    const next = { ...seenCounts, [ticket._id]: total };
    setSeenCounts(next);
    try {
      localStorage.setItem("ticketSeenResponseCounts", JSON.stringify(next));
    } catch {}
  };

  const showNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, notification]);

    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Live updates: reflect status changes and response updates from admin dashboard
  useEffect(() => {
    const onTicketUpdated = (e) => {
      const updated = e.detail;
      if (!updated?._id) return;

      // Find the ticket to get its subject
      const ticketSubject =
        tickets.find((t) => t._id === updated._id)?.subject || "Your ticket";

      setTickets((prev) =>
        prev.map((t) =>
          t._id === updated._id
            ? {
                ...t,
                status: updated.status,
                updatedAt: updated.updatedAt || t.updatedAt,
              }
            : t
        )
      );

      // Show notification for status change
      showNotification(
        `Status updated to "${updated.status}" for "${ticketSubject}"`,
        "info"
      );
    };

    const onResponseAdded = (e) => {
      const { ticketId, ticket } = e.detail;
      if (!ticketId || !ticket) return;

      // Find the ticket to get its subject
      const ticketSubject =
        tickets.find((t) => t._id === ticketId)?.subject || "Your ticket";

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? {
                ...t,
                responses: ticket.responses,
                updatedAt: ticket.updatedAt || t.updatedAt,
              }
            : t
        )
      );

      // Show notification
      showNotification(
        `New response received for "${ticketSubject}"`,
        "success"
      );
    };

    const onResponseUpdated = (e) => {
      const { ticketId, ticket } = e.detail;
      if (!ticketId || !ticket) return;

      const ticketSubject =
        tickets.find((t) => t._id === ticketId)?.subject || "Your ticket";

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? {
                ...t,
                responses: ticket.responses,
                updatedAt: ticket.updatedAt || t.updatedAt,
              }
            : t
        )
      );

      // Show notification
      showNotification(`Response updated for "${ticketSubject}"`, "info");
    };

    const onResponseDeleted = (e) => {
      const { ticketId, ticket } = e.detail;
      if (!ticketId || !ticket) return;

      const ticketSubject =
        tickets.find((t) => t._id === ticketId)?.subject || "Your ticket";

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? {
                ...t,
                responses: ticket.responses,
                updatedAt: ticket.updatedAt || t.updatedAt,
              }
            : t
        )
      );

      // Show notification
      showNotification(`Response deleted for "${ticketSubject}"`, "warning");
    };

    const onStorage = (e) => {
      if (!e.newValue) return;

      try {
        let payload;
        if (e.key === "ticketUpdatedBroadcast") {
          payload = JSON.parse(e.newValue);
          if (payload?._id) {
            const ticketSubject =
              tickets.find((t) => t._id === payload._id)?.subject ||
              "Your ticket";
            setTickets((prev) =>
              prev.map((t) =>
                t._id === payload._id
                  ? {
                      ...t,
                      status: payload.status,
                      updatedAt: payload.updatedAt || t.updatedAt,
                    }
                  : t
              )
            );
            showNotification(
              `Status updated to "${payload.status}" for "${ticketSubject}"`,
              "info"
            );
          }
        } else if (e.key === "ticketResponseAdded") {
          payload = JSON.parse(e.newValue);
          if (payload?.ticketId && payload?.ticket) {
            setTickets((prev) =>
              prev.map((t) =>
                t._id === payload.ticketId
                  ? {
                      ...t,
                      responses: payload.ticket.responses,
                      updatedAt: payload.ticket.updatedAt || t.updatedAt,
                    }
                  : t
              )
            );
          }
        } else if (e.key === "ticketResponseUpdated") {
          payload = JSON.parse(e.newValue);
          if (payload?.ticketId && payload?.ticket) {
            setTickets((prev) =>
              prev.map((t) =>
                t._id === payload.ticketId
                  ? {
                      ...t,
                      responses: payload.ticket.responses,
                      updatedAt: payload.ticket.updatedAt || t.updatedAt,
                    }
                  : t
              )
            );
          }
        } else if (e.key === "ticketResponseDeleted") {
          payload = JSON.parse(e.newValue);
          if (payload?.ticketId && payload?.ticket) {
            setTickets((prev) =>
              prev.map((t) =>
                t._id === payload.ticketId
                  ? {
                      ...t,
                      responses: payload.ticket.responses,
                      updatedAt: payload.ticket.updatedAt || t.updatedAt,
                    }
                  : t
              )
            );
          }
        }
      } catch {}
    };

    window.addEventListener("ticket-updated", onTicketUpdated);
    window.addEventListener("ticket-response-added", onResponseAdded);
    window.addEventListener("ticket-response-updated", onResponseUpdated);
    window.addEventListener("ticket-response-deleted", onResponseDeleted);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("ticket-updated", onTicketUpdated);
      window.removeEventListener("ticket-response-added", onResponseAdded);
      window.removeEventListener("ticket-response-updated", onResponseUpdated);
      window.removeEventListener("ticket-response-deleted", onResponseDeleted);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      await axios.delete(`${API_BASE}/tickets/${id}`, {
        headers: { "x-user-email": userEmail },
      });
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ticket");
    }
  };

  const handleEdit = (ticket) => {
    try {
      localStorage.setItem("userEmail", ticket.email || "");
    } catch {}
    navigate("/createTicket", { state: { mode: "edit", ticket } });
  };

  const statusBadgeClass = (status) => {
    if (!status) return "badge badge-gray";
    const lowercase = String(status).toLowerCase();
    if (lowercase === "pending") return "badge badge-yellow";
    if (lowercase === "resolved" || lowercase === "closed")
      return "badge badge-green";
    return "badge badge-gray";
  };

  const typeBadge = (type) => {
    if (!type) return "badge badge-gray";
    return "badge badge-gray";
  };

  if (loading) return <p className="p-4">Loading tickets...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === "success"
                ? "bg-green-50 border-green-400 text-green-800"
                : notification.type === "warning"
                ? "bg-yellow-50 border-yellow-400 text-yellow-800"
                : "bg-blue-50 border-blue-400 text-blue-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="page-shell">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
          <h1 className="page-title">My Tickets</h1>
          <div className="w-full md:w-auto flex justify-end gap-3 ml-auto">
            <Link
              to="/createTicket"
              className="btn btn-md bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Link>
            <button
              onClick={() => navigate("/")}
              className="btn btn-md bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
            >
              Back to Contact
            </button>
          </div>
        </div>

        {location.state?.isEdit ? (
          <p className="alert-success mb-4 text-center">
            Ticket updated successfully!
          </p>
        ) : (
          location.state?.newTicket && (
            <p className="alert-success mb-4 text-center">
              Ticket created successfully!
            </p>
          )
        )}

        <div>
          {tickets.map((ticket) => (
            <div key={ticket._id} className="card-item">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {ticket.subject}
                    </h2>
                    <span className={statusBadgeClass(ticket.status)}>
                      {String(ticket.status || "").toUpperCase() || "PENDING"}
                    </span>
                    <span className={typeBadge(ticket.inquiryType)}>
                      {String(ticket.inquiryType || "").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{ticket.description}</p>
                  <p className="text-sm text-gray-500">
                    Updated:{" "}
                    {new Date(
                      ticket.updatedAt || ticket.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  {/* Notification bell */}
                  <button
                    onClick={() => {
                      setExpandedId(
                        expandedId === ticket._id ? null : ticket._id
                      );
                      markResponsesSeen(ticket);
                    }}
                    className={`btn btn-sm ${
                      getUnseenCount(ticket) > 0
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                    title={
                      getUnseenCount(ticket) > 0
                        ? `${getUnseenCount(ticket)} new response${
                            getUnseenCount(ticket) > 1 ? "s" : ""
                          }`
                        : "No new responses"
                    }
                  >
                    <div className="relative flex items-center">
                      <Bell className="w-4 h-4 mr-1" />
                      <span>Notify</span>
                      {getUnseenCount(ticket) > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] px-1.5 py-0.5">
                          {getUnseenCount(ticket)}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === ticket._id ? null : ticket._id
                      )
                    }
                    className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                    title={
                      expandedId === ticket._id
                        ? "Hide details"
                        : "View details"
                    }
                  >
                    <Eye className="w-4 h-4 mr-1" />{" "}
                    {expandedId === ticket._id ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => handleEdit(ticket)}
                    className="btn btn-warning btn-sm"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ticket._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === ticket._id && (
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium text-gray-900">Name:</span>{" "}
                        {ticket.name}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-gray-900">
                          Email:
                        </span>{" "}
                        {ticket.email}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-gray-900">Type:</span>{" "}
                        {ticket.inquiryType}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium text-gray-900">
                          Status:
                        </span>{" "}
                        {ticket.status}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-gray-900">
                          Created:
                        </span>{" "}
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-gray-900">
                          Updated:
                        </span>{" "}
                        {new Date(
                          ticket.updatedAt || ticket.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {ticket.attachment && (
                    <p className="mt-3">
                      <span className="font-medium text-gray-900">
                        Attachment:
                      </span>{" "}
                      {ticket.attachment}
                    </p>
                  )}
                  {/* Latest response only */}
                  {Array.isArray(ticket.responses) &&
                    ticket.responses.length > 0 &&
                    (() => {
                      const resp =
                        ticket.responses[ticket.responses.length - 1];
                      return (
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Latest response
                          </h3>
                          <div className="rounded-md border border-gray-200 bg-white p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-800 font-medium">
                                {resp.sender === "admin"
                                  ? "Support"
                                  : ticket.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {resp.editedAt
                                  ? new Date(resp.editedAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-gray-700">
                              {resp.message}
                            </p>
                            {resp.attachment && (
                              <p className="mt-1 text-xs text-gray-600">
                                <span className="font-medium">Attachment:</span>{" "}
                                {resp.attachment}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              )}
              <div className="mt-3 text-sm text-gray-600">
                <span className="mr-2 font-medium">{ticket.name}</span>
                <span className="text-gray-500">{ticket.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicketList;
