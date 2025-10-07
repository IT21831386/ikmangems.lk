/* eslint-disable no-empty */
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Use relative API base so Vite dev proxy forwards to backend (/api/*)
const API_BASE = "http://localhost:5001/api";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/feedbacks`);
      setFeedbacks(res.data.feedbacks);
    } catch (err) {
      console.error("Error fetching feedbacks:", err.message);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/feedbacks`, form);
      // Persist the email so we can separate user's feedbacks on the list page
      try {
        if (form?.email) {
          localStorage.setItem("feedbackUserEmail", form.email);
        }
      } catch {}
      setForm({ name: "", email: "", message: "", rating: 5 });
      // Navigate to feedback list after successful submit
      navigate("/feedback-list");
    } catch (err) {
      console.error("Error submitting feedback:", err.message);
    }
    setLoading(false);
  };

  // Note: Deletion from this page has been removed per requirements

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Feedback</h1>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Submit Feedback
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="message"
            placeholder="Your message"
            value={form.message}
            onChange={handleChange}
            required
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setForm((prev) => ({ ...prev, rating: num }))}
                  className={`text-2xl leading-none ${
                    num <= form.rating ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-500`}
                  aria-label={`Rate ${num} star${num > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          All Feedbacks
        </h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-600">No feedbacks yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <p className="text-gray-800">
                  <strong>{fb.name}</strong> ({fb.email})
                </p>
                <p className="text-gray-700 mt-1">{fb.message}</p>
                <div className="mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`text-xl ${
                        n <= (fb.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(fb.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
