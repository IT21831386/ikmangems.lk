import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5001/api";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ message: "", rating: 5 });
  const [loadingId, setLoadingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch feedbacks
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

  const userEmail = (() => {
    try {
      return localStorage.getItem("feedbackUserEmail") || "";
    } catch {
      return "";
    }
  })();

  const filtered =
    (searchQuery || "").trim().length === 0
      ? feedbacks
      : feedbacks.filter((f) => {
          const q = searchQuery.toLowerCase();
          return (
            String(f.name || "")
              .toLowerCase()
              .includes(q) ||
            String(f.email || "")
              .toLowerCase()
              .includes(q) ||
            String(f.message || "")
              .toLowerCase()
              .includes(q)
          );
        });

  const userFeedbacks = filtered.filter((f) => f.email === userEmail);
  const otherFeedbacks = filtered.filter((f) => f.email !== userEmail);

  const startEdit = (fb) => {
    setEditingId(fb._id);
    setEditForm({ message: fb.message || "", rating: fb.rating || 5 });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ message: "", rating: 5 });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const saveEdit = async (id) => {
    setLoadingId(id);
    try {
      await axios.put(`${API_BASE}/feedbacks/${id}`, editForm);
      await fetchFeedbacks();
      cancelEdit();
    } catch (err) {
      console.error("Error updating feedback:", err.message);
    }
    setLoadingId(null);
  };

  const deleteFeedback = async (id) => {
    setLoadingId(id);
    try {
      await axios.delete(`${API_BASE}/feedbacks/${id}`);
      await fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting feedback:", err.message);
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Feedbacks</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, message..."
              className="w-full md:w-80 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSearchQuery(searchInput)}
              className="btn btn-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              Search
            </button>
            <a
              href="/feedback"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              New Feedback
            </a>
          </div>
        </div>
        <div className="h-px bg-gray-200 my-4" />

        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Your Feedbacks {userEmail ? `(${userEmail})` : ""}
          </h3>
          {userFeedbacks.length === 0 ? (
            <p className="text-gray-600">No feedbacks submitted by you yet.</p>
          ) : (
            <div className="space-y-4">
              {userFeedbacks.map((fb) => (
                <div
                  key={fb._id}
                  className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                >
                  <p className="text-gray-800">
                    <strong>{fb.name}</strong> ({fb.email})
                  </p>
                  {editingId === fb._id ? (
                    <div className="mt-2">
                      <textarea
                        name="message"
                        value={editForm.message}
                        onChange={handleEditChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-medium">
                          Rating:
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              type="button"
                              key={n}
                              onClick={() =>
                                setEditForm((prev) => ({ ...prev, rating: n }))
                              }
                              className={`text-2xl leading-none ${
                                n <= editForm.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              } hover:text-yellow-500`}
                              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => saveEdit(fb._id)}
                          disabled={loadingId === fb._id}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 mr-2"
                        >
                          {loadingId === fb._id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      <div className="mt-2">
                        <button
                          onClick={() => startEdit(fb)}
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFeedback(fb._id)}
                          disabled={loadingId === fb._id}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {loadingId === fb._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Other Users' Feedbacks
          </h3>
          {otherFeedbacks.length === 0 ? (
            <p className="text-gray-600">No other feedbacks yet.</p>
          ) : (
            <div className="space-y-4">
              {otherFeedbacks.map((fb) => (
                <div
                  key={fb._id}
                  className="border border-gray-200 bg-gray-50 rounded-lg p-4"
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
        </section>
      </div>
    </div>
  );
};

export default FeedbackList;
