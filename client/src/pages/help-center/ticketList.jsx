/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, Bell, Search, X, Download } from "lucide-react"; // ✅ make sure Download is imported

const API_BASE = "http://localhost:5001/api";

function TicketList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [seenCounts, setSeenCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(null);

  // Helper function to ensure unique tickets by ID
  const getUniqueTickets = (tickets) => {
    const seen = new Set();
    return tickets.filter(ticket => {
      if (seen.has(ticket._id)) {
        return false;
      }
      seen.add(ticket._id);
      return true;
    });
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await axios.get(`${API_BASE}/tickets`, {
          params: email ? { email } : {},
        });
        let allTickets = res.data.tickets || [];

        // Handle new/updated tickets
        if (location.state?.newTicket) {
          const newTicket = location.state.newTicket;
          const exists = allTickets.find((t) => t._id === newTicket._id);
          if (!exists) allTickets = [newTicket, ...allTickets];
        }

        if (location.state?.isEdit && location.state.updatedTicket) {
          const updated = location.state.updatedTicket;
          allTickets = allTickets.map((t) => (t._id === updated._id ? updated : t));
        }

        const uniqueTickets = getUniqueTickets(allTickets);
        setTickets(uniqueTickets);
        setFilteredTickets(uniqueTickets);
        setLoading(false);

        if (location.state?.newTicket || location.state?.isEdit) {
          window.history.replaceState({}, document.title);
        }
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

  // 🔍 Filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => {
        const search = searchTerm.toLowerCase();
        return (
          ticket.subject?.toLowerCase().includes(search) ||
          ticket.status?.toLowerCase().includes(search) ||
          ticket.inquiryType?.toLowerCase().includes(search) ||
          ticket.description?.toLowerCase().includes(search) ||
          ticket.name?.toLowerCase().includes(search) ||
          ticket.email?.toLowerCase().includes(search)
        );
      });
      setFilteredTickets(filtered);
    }
  }, [searchTerm, tickets]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      await axios.delete(`${API_BASE}/tickets/${id}`, {
        headers: { "x-user-email": userEmail }
      });
      setTickets((prev) => prev.filter((t) => t._id !== id));
      setFilteredTickets((prev) => prev.filter((t) => t._id !== id));
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

  const handleDownloadPDF = async (ticketId) => {
    try {
      setDownloadingPDF(ticketId);
      const userEmail = localStorage.getItem("userEmail") || "";
      const pdfURL = `${API_BASE}/tickets/${ticketId}/pdf`;
      
      console.log('Downloading PDF for ticket:', ticketId);
      console.log('PDF URL:', pdfURL);
      console.log('User email:', userEmail);
      
      // Add authorization header if needed
      const response = await fetch(pdfURL, {
        method: 'GET',
        headers: {
          'x-user-email': userEmail
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      // Create blob from response
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Empty PDF file received');
      }
      
      const url = window.URL.createObjectURL(blob);
      
      // Create and click download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download completed successfully');
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setDownloadingPDF(null);
    }
  };

  if (loading) return <p className="p-4">Loading tickets...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
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

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button onClick={() => setSearchTerm("")}>
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {filteredTickets.map(ticket => (
        <div key={ticket._id} className="bg-white rounded-xl shadow p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-700">{ticket.subject}</h2>
                <span className={statusBadgeClass(ticket.status)}>{ticket.status?.toUpperCase()}</span>
                <span className={typeBadge(ticket.inquiryType)}>{ticket.inquiryType?.toUpperCase()}</span>
              </div>
              <p className="text-gray-600">{ticket.description}</p>
              <p className="text-sm text-gray-400">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => {
                  setExpandedId(expandedId === ticket._id ? null : ticket._id);
                  markResponsesSeen(ticket);
                }}
                title="Toggle responses"
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  getUnseenCount(ticket) > 0
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleEdit(ticket)}
                title="Edit"
                className="px-3 py-1.5 rounded-lg bg-yellow-200 text-yellow-800 text-xs"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(ticket._id)}
                title="Delete"
                className="px-3 py-1.5 rounded-lg bg-red-200 text-red-800 text-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>

               {/* ✅ PDF Download button */}
               <button
                 onClick={() => handleDownloadPDF(ticket._id)}
                 disabled={downloadingPDF === ticket._id}
                 title="Download PDF"
                 className={`px-3 py-1.5 rounded-lg text-xs ${
                   downloadingPDF === ticket._id
                     ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                     : "bg-green-200 text-green-800 hover:bg-green-300"
                 }`}
               >
                 {downloadingPDF === ticket._id ? (
                   <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <Download className="w-4 h-4" />
                 )}
               </button>
            </div>
          </div>

          {expandedId === ticket._id && (
            <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm">
              <p><strong>Name:</strong> {ticket.name}</p>
              <p><strong>Email:</strong> {ticket.email}</p>
              <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
              {ticket.responses?.length > 0 && (
                <div className="mt-2">
                  <strong>Latest Response:</strong>
                  <div className="p-2 bg-white border mt-1 rounded">
                    <p><strong>By:</strong> {ticket.responses.at(-1)?.sender}</p>
                    <p>{ticket.responses.at(-1)?.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TicketList;