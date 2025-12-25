/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5001/api/support/tickets"; // adjust if your backend runs on different port

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [editingResponse, setEditingResponse] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [showAddResponseModal, setShowAddResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // Load tickets on mount or when filter changes
  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}${filterStatus ? `?status=${filterStatus}` : ""}`
      );
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        setError(data.message || "Failed to load tickets");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        setNewStatus(data.ticket.status); // sync dropdown
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to load ticket");
    }
  };

  const updateStatus = async (ticketId) => {
    try {
      const res = await fetch(`${API_BASE}/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Status updated!");
        loadTicketDetails(ticketId); // refresh ticket view
        loadTickets(); // refresh list

        // Broadcast status update event for notifications
        window.dispatchEvent(
          new CustomEvent("ticket-updated", {
            detail: {
              _id: ticketId,
              status: newStatus,
              updatedAt: data.ticket?.updatedAt || new Date().toISOString(),
            },
          })
        );

        // Also broadcast via localStorage for cross-tab communication
        try {
          localStorage.setItem(
            "ticketUpdatedBroadcast",
            JSON.stringify({
              _id: ticketId,
              status: newStatus,
              updatedAt: data.ticket?.updatedAt || new Date().toISOString(),
              ts: Date.now(),
            })
          );
          // Clean up to avoid cluttering storage
          setTimeout(
            () => localStorage.removeItem("ticketUpdatedBroadcast"),
            100
          );
        } catch {}
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const addResponse = async () => {
    if (!responseMessage.trim()) return alert("Please enter a message");
    if (!selectedTicket) return;

    try {
      const res = await fetch(`${API_BASE}/${selectedTicket._id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseMessage }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Response added!");
        setResponseMessage("");
        setShowAddResponseModal(false);
        loadTicketDetails(selectedTicket._id); // refresh conversation

        // Broadcast response added event for notifications
        window.dispatchEvent(
          new CustomEvent("ticket-response-added", {
            detail: {
              ticketId: selectedTicket._id,
              ticket: data.ticket,
              timestamp: Date.now(),
            },
          })
        );

        // Also broadcast via localStorage for cross-tab communication
        try {
          localStorage.setItem(
            "ticketResponseAdded",
            JSON.stringify({
              ticketId: selectedTicket._id,
              ticket: data.ticket,
              timestamp: Date.now(),
            })
          );
          // Clean up immediately to avoid cluttering storage
          setTimeout(() => localStorage.removeItem("ticketResponseAdded"), 100);
        } catch {}
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to add response");
    }
  };

  const openAddResponseModal = () => {
    if (selectedTicket?.responses?.length > 0) {
      alert(
        "This ticket already has a response. You can only add one response per ticket."
      );
      return;
    }
    setShowAddResponseModal(true);
  };

  const closeAddResponseModal = () => {
    setShowAddResponseModal(false);
    setResponseMessage("");
  };

  const editResponse = async (ticketId) => {
    if (!editMessage.trim()) return alert("Please enter a message");

    try {
      const res = await fetch(`${API_BASE}/${ticketId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editMessage }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Response updated!");
        setEditMessage("");
        setEditingResponse(null);
        loadTicketDetails(ticketId); // refresh conversation

        // Broadcast response updated event for notifications
        window.dispatchEvent(
          new CustomEvent("ticket-response-updated", {
            detail: {
              ticketId: ticketId,
              ticket: data.ticket,
              timestamp: Date.now(),
            },
          })
        );

        // Also broadcast via localStorage for cross-tab communication
        try {
          localStorage.setItem(
            "ticketResponseUpdated",
            JSON.stringify({
              ticketId: ticketId,
              ticket: data.ticket,
              timestamp: Date.now(),
            })
          );
          setTimeout(
            () => localStorage.removeItem("ticketResponseUpdated"),
            100
          );
        } catch {}
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to update response");
    }
  };

  const deleteResponse = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      const res = await fetch(`${API_BASE}/${ticketId}/response`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Response deleted!");
        loadTicketDetails(ticketId); // refresh conversation

        // Broadcast response deleted event for notifications
        window.dispatchEvent(
          new CustomEvent("ticket-response-deleted", {
            detail: {
              ticketId: ticketId,
              ticket: data.ticket,
              timestamp: Date.now(),
            },
          })
        );

        // Also broadcast via localStorage for cross-tab communication
        try {
          localStorage.setItem(
            "ticketResponseDeleted",
            JSON.stringify({
              ticketId: ticketId,
              ticket: data.ticket,
              timestamp: Date.now(),
            })
          );
          setTimeout(
            () => localStorage.removeItem("ticketResponseDeleted"),
            100
          );
        } catch {}
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to delete response");
    }
  };

  const startEditing = (response) => {
    setEditingResponse(response);
    setEditMessage(response.message);
  };

  const cancelEditing = () => {
    setEditingResponse(null);
    setEditMessage("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="app-container">
      <div className="page-shell">
        <h1 className="page-title mb-8">🛠️ Support Dashboard</h1>

        {/* Filter Bar */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <label className="field-label mb-0">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select w-auto"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button onClick={loadTickets} className="btn btn-primary btn-md">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tickets List */}
        <div className="card mb-6">
          <h3 className="section-title mb-4">Tickets ({tickets.length})</h3>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => loadTicketDetails(ticket._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?._id === ticket._id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold text-gray-800">
                    {ticket.subject}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {ticket.name} • {ticket.email}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`badge ${
                        ticket.status === "pending"
                          ? "badge-yellow"
                          : ticket.status === "open"
                          ? "bg-blue-100 text-blue-800"
                          : ticket.status === "in_progress"
                          ? "bg-orange-100 text-orange-800"
                          : ticket.status === "resolved"
                          ? "badge-green"
                          : "badge-gray"
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details Panel */}
        {selectedTicket && (
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <h3 className="section-title">{selectedTicket.subject}</h3>
              <span
                className={`badge ${
                  selectedTicket.status === "pending"
                    ? "badge-yellow"
                    : selectedTicket.status === "open"
                    ? "bg-blue-100 text-blue-800"
                    : selectedTicket.status === "in_progress"
                    ? "bg-orange-100 text-orange-800"
                    : selectedTicket.status === "resolved"
                    ? "badge-green"
                    : "badge-gray"
                }`}
              >
                {selectedTicket.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <p>
                <strong>From:</strong> {selectedTicket.name} (
                {selectedTicket.email})
              </p>
              <p>
                <strong>Type:</strong> {selectedTicket.inquiryType}
              </p>
              <p>
                <strong>Description:</strong> {selectedTicket.description}
              </p>
              {selectedTicket.attachment && (
                <p>
                  <strong>Attachment:</strong>{" "}
                  <a
                    href={selectedTicket.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View File
                  </a>
                </p>
              )}
            </div>

            <hr className="my-6" />

            {/* Update Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <label className="field-label mb-0">Update Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="select w-auto"
                >
                  <option value="pending">Pending</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => updateStatus(selectedTicket._id)}
                  className="btn btn-primary btn-md"
                >
                  Save Status
                </button>
              </div>
            </div>

            {/* Response Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="section-title">Response</h4>
                {selectedTicket.responses?.length === 0 && (
                  <button
                    onClick={openAddResponseModal}
                    className="btn btn-primary btn-md"
                  >
                    Add Response
                  </button>
                )}
              </div>

              {selectedTicket.responses?.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTicket.responses.map((resp, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-2">
                            Support Team Response:
                          </div>

                          {editingResponse === resp ? (
                            <div className="space-y-3">
                              <textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                rows="3"
                                className="textarea w-full"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    editResponse(selectedTicket._id)
                                  }
                                  className="btn btn-primary btn-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="btn btn-danger btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-700">{resp.message}</div>
                          )}

                          {resp.attachment && (
                            <div className="mt-2">
                              <a
                                href={resp.attachment}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                📎 Attachment
                              </a>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-2">
                            {formatDate(
                              resp.editedAt || selectedTicket.createdAt
                            )}
                            {resp.editedAt && (
                              <span className="text-orange-600 ml-2">
                                (edited)
                              </span>
                            )}
                          </div>
                        </div>

                        {!editingResponse && (
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => startEditing(resp)}
                              className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                              title="Edit response"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteResponse(selectedTicket._id)}
                              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                              title="Delete response"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">No response added yet</p>
                  <button
                    onClick={openAddResponseModal}
                    className="btn btn-primary btn-md"
                  >
                    Add Response
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Response Modal */}
        {showAddResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="section-title mb-4">Add Response</h3>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response..."
                rows="4"
                className="textarea mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={closeAddResponseModal}
                  className="btn btn-md bg-gray-200 text-gray-800 hover:bg-gray-300 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={addResponse}
                  className="btn btn-primary btn-md flex-1"
                >
                  Add Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
