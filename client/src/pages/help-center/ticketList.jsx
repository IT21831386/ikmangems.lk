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
  const [seenCounts, setSeenCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await axios.get(`${API_BASE}/tickets`, {
          params: email ? { email } : {},
        });
        let allTickets = res.data.tickets || [];

        if (location.state?.isEdit && location.state?.updatedTicket) {
          const u = location.state.updatedTicket;
          allTickets = allTickets.map((t) => (t._id === u._id ? u : t));
        } else if (location.state?.newTicket) {
          allTickets = [location.state.newTicket, ...allTickets];
        }

        setTickets(allTickets);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

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
    const notification = { id: Date.now(), message, type, timestamp: Date.now() };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id)), 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      await axios.delete(`${API_BASE}/tickets/${id}`, { headers: { "x-user-email": userEmail } });
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ticket");
    }
  };

  const handleEdit = (ticket) => {
    try { localStorage.setItem("userEmail", ticket.email || ""); } catch {}
    navigate("/createTicket", { state: { mode: "edit", ticket } });
  };

  const statusBadgeClass = (status) => {
    if (!status) return "bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs";
    const lower = String(status).toLowerCase();
    if (lower === "pending") return "bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs";
    if (lower === "resolved" || lower === "closed") return "bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs";
    return "bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs";
  };

  const typeBadge = (type) => "bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs";

  if (loading) return <p className="p-4">Loading tickets...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      {/* Notifications */}
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
              <button onClick={() => removeNotification(notification.id)} className="ml-2 text-gray-400 hover:text-gray-600">×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <div className="w-full md:w-auto flex justify-end gap-3 ml-auto">
          <Link
            to="/createTicket"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Link>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
          >
            Back to Contact
          </button>
        </div>
      </div>

      {location.state?.isEdit ? (
        <p className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded">Ticket updated successfully!</p>
      ) : location.state?.newTicket && (
        <p className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded">Ticket created successfully!</p>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
                  <span className={statusBadgeClass(ticket.status)}>{String(ticket.status || "").toUpperCase() || "PENDING"}</span>
                  <span className={typeBadge(ticket.inquiryType)}>{String(ticket.inquiryType || "").toUpperCase()}</span>
                </div>
                <p className="text-gray-600 mb-2">{ticket.description}</p>
                <p className="text-sm text-gray-500">Updated: {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => { setExpandedId(expandedId === ticket._id ? null : ticket._id); markResponsesSeen(ticket); }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    getUnseenCount(ticket) > 0
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  title={getUnseenCount(ticket) > 0 ? `${getUnseenCount(ticket)} new response${getUnseenCount(ticket) > 1 ? "s" : ""}` : "No new responses"}
                >
                  <Bell className="w-4 h-4 mr-1" /> Notify
                  {getUnseenCount(ticket) > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] px-1.5 py-0.5">
                      {getUnseenCount(ticket)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === ticket._id ? null : ticket._id)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" /> {expandedId === ticket._id ? "Hide" : "View"}
                </button>
                <button
                  onClick={() => handleEdit(ticket)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-200 text-yellow-800 hover:bg-yellow-300 text-sm"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ticket._id)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-200 text-red-800 hover:bg-red-300 text-sm"
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
                    <p><span className="font-medium text-gray-900">Name:</span> {ticket.name}</p>
                    <p className="mt-1"><span className="font-medium text-gray-900">Email:</span> {ticket.email}</p>
                    <p className="mt-1"><span className="font-medium text-gray-900">Type:</span> {ticket.inquiryType}</p>
                  </div>
                  <div>
                    <p><span className="font-medium text-gray-900">Status:</span> {ticket.status}</p>
                    <p className="mt-1"><span className="font-medium text-gray-900">Created:</span> {new Date(ticket.createdAt).toLocaleString()}</p>
                    <p className="mt-1"><span className="font-medium text-gray-900">Updated:</span> {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {ticket.attachment && (
                  <p className="mt-3"><span className="font-medium text-gray-900">Attachment:</span> {ticket.attachment}</p>
                )}

                {Array.isArray(ticket.responses) && ticket.responses.length > 0 && (() => {
                  const resp = ticket.responses[ticket.responses.length - 1];
                  return (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Latest response</h3>
                      <div className="rounded-md border border-gray-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">{resp.sender === "admin" ? "Support" : ticket.name}</span>
                          <span className="text-xs text-gray-500">{resp.editedAt ? new Date(resp.editedAt).toLocaleString() : ""}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700">{resp.message}</p>
                        {resp.attachment && <p className="mt-1 text-xs text-gray-600"><span className="font-medium">Attachment:</span> {resp.attachment}</p>}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketList;
