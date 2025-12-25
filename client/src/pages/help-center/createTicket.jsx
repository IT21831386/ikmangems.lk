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
    inquiryType: "auction",
    description: "",
    attachment: null,
  });
  // If navigated in edit mode, prefill form
  useEffect(() => {
    try {
      const navState = window.history.state && window.history.state.usr;
      if (navState?.mode === "edit" && navState.ticket) {
        const t = navState.ticket;
        setFormData({
          name: t.name || "",
          email: t.email || "",
          subject: t.subject || "",
          inquiryType: t.inquiryType || "auction",
          description: t.description || "",
          attachment: null,
        });
        // Stash id for submit
        setEditingId(t._id);
      }
    } catch {}
  }, []);

  const [editingId, setEditingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData((prev) => ({
        ...prev,
        attachment: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        inquiryType: formData.inquiryType,
        description: formData.description,
      };

      const userEmail = formData.email;
      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/tickets/${editingId}`, payload, {
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
        });
      } else {
        res = await axios.post(`${API_BASE}/tickets`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Persist user identity to localStorage for listing
      try {
        localStorage.setItem("userEmail", formData.email);
      } catch {}
      // Navigate to ticketList with contextual state
      if (editingId) {
        navigate("/ticketList", {
          state: { updatedTicket: res.data.ticket, isEdit: true },
        });
      } else {
        navigate("/ticketList", {
          state: { newTicket: res.data.ticket, isEdit: false },
        });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to create ticket. Please try again."
      );
    }
  };

  const isEdit = Boolean(editingId);

  const handleCancel = () => {
    if (isEdit) navigate("/ticketList");
    else navigate("/");
  };

  return (
    <div className="app-container flex items-center justify-center p-6">
      <div className="w-full max-w-lg card">
        <h2 className="section-title mb-6 text-center">
          {isEdit ? "Update Ticket" : "Create New Ticket"}
        </h2>

        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="field-label">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="field-label">Inquiry Type</label>
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="auction">Auction</option>
              <option value="payment">Payment</option>
              <option value="feedback">Feedback</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="textarea"
              required
            ></textarea>
          </div>

          <div>
            <label className="field-label">Attachment (optional)</label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-md w-1/2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md w-1/2">
              {isEdit ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
