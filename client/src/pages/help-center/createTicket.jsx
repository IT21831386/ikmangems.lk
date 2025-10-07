/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5001/api";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    inquiryType: "general",
    description: "",
    attachment: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill form if editing
  useEffect(() => {
    try {
      const navState = window.history.state && window.history.state.usr;
      if (navState?.mode === "edit" && navState.ticket) {
        const t = navState.ticket;
        setFormData({
          name: t.name || "",
          email: t.email || "",
          subject: t.subject || "",
          inquiryType: t.inquiryType || "general",
          description: t.description || "",
          attachment: null,
        });
        setEditingId(t._id);
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData((prev) => ({ ...prev, attachment: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("subject", formData.subject);
      payload.append("inquiryType", formData.inquiryType);
      payload.append("description", formData.description);
      if (formData.attachment) {
        payload.append("attachment", formData.attachment);
      }

      const userEmail = formData.email;
      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/tickets/${editingId}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-email": userEmail,
          },
        });
      } else {
        res = await axios.post(`${API_BASE}/tickets`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      try {
        localStorage.setItem("userEmail", formData.email);
      } catch {}

      if (editingId) {
        navigate("/ticketList", { state: { updatedTicket: res.data.ticket, isEdit: true } });
      } else {
        window.alert("This ticket can only be edited within 3 hours of creation.");
        navigate("/ticketList", { state: { newTicket: res.data.ticket, isEdit: false } });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to create ticket. Please try again.");
    }
  };

  const isEdit = Boolean(editingId);
  const handleCancel = () => {
    if (isEdit) navigate("/ticketList");
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEdit ? "Update Ticket" : "Create New Ticket"}
        </h2>

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {[
                { key: 'general', label: 'General', color: 'bg-gray-200' },
                { key: 'seller', label: 'Seller', color: 'bg-indigo-200' },
                { key: 'buyer', label: 'Buyer', color: 'bg-green-200' },
                { key: 'verification', label: 'Verification', color: 'bg-yellow-200' },
                { key: 'support', label: 'Support', color: 'bg-blue-200' },
                { key: 'auction', label: 'Auction', color: 'bg-purple-200' },
                { key: 'payment', label: 'Payment', color: 'bg-pink-200' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, inquiryType: c.key }))}
                  className={`h-10 rounded flex items-center justify-center text-sm font-medium ${c.color} ${formData.inquiryType === c.key ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Description"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="w-full"
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
