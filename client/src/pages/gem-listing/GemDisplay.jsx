import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { gemstoneAPI } from "../../services/api";

const BACKEND_BASE = "http://localhost:5001/";

function normalizeImageUrl(url) {
  if (!url) return "";
  let u = String(url).replace(/\\/g, "/");
  u = u.replace(/^\/+/, "");
  if (/^https?:\/\//i.test(u)) return u;
  return BACKEND_BASE + u;
}

function parseRange(value) {
  if (!value) return { min: null, max: null };
  if (value.endsWith("+")) {
    const n = parseFloat(value);
    return { min: isNaN(n) ? null : n, max: null };
  }
  const [minStr, maxStr] = value.split("-");
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);
  return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
}

const GemstoneCRUDDisplay = () => {
  const [gemstones, setGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    gemstone: null,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [bidFilter, setBidFilter] = useState("");

  const categories = [
    "Diamond",
    "Ruby",
    "Sapphire",
    "Emerald",
    "Topaz",
    "Garnet",
    "Amethyst",
    "Citrine",
    "Aquamarine",
    "Tourmaline",
    "Moonstone",
    "Peridot",
    "Opal",
    "Pearl",
    "Other",
  ];

  const weightRanges = [
    { label: "All Weights", value: "" },
    { label: "0-1 carats", value: "0-1" },
    { label: "1-2 carats", value: "1-2" },
    { label: "2-3 carats", value: "2-3" },
    { label: "3+ carats", value: "3+" },
  ];

  const fetchGemstones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const priceRange = parseRange(bidFilter);
      const wRange = parseRange(weightFilter);
      const response = await gemstoneAPI.getGemstones({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        minPrice: priceRange.min != null ? String(priceRange.min) : undefined,
        maxPrice: priceRange.max != null ? String(priceRange.max) : undefined,
        minWeight: wRange.min != null ? String(wRange.min) : undefined,
        maxWeight: wRange.max != null ? String(wRange.max) : undefined,
      });
      if (response.success) {
        setGemstones(response.data.gemstones || []);
      } else {
        setError("Failed to fetch gemstones");
      }
    } catch (err) {
      console.error("Error fetching gemstones:", err);
      setError(err.message || "Failed to fetch gemstones");
    } finally {
      setLoading(false);
    }
  }, [bidFilter, selectedCategory, weightFilter, searchTerm]);

  useEffect(() => {
    fetchGemstones();
  }, [fetchGemstones]);

  const filteredGemstones = useMemo(() => {
    return gemstones.filter((g) => {
      const matchesSearch =
        !searchTerm ||
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !selectedStatus || g.verificationStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [gemstones, searchTerm, selectedStatus]);

  function handleSearch() {
    fetchGemstones();
  }
  function handleUpdate(id) {
    const gemstone = gemstones.find((g) => g._id === id);
    if (gemstone) setUpdateModal({ isOpen: true, gemstone });
  }
  function closeUpdateModal() {
    setUpdateModal({ isOpen: false, gemstone: null });
  }

  async function handleUpdateSubmit(updatedData) {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        const val = updatedData[key];
        if (val === null || val === undefined) return;
        if (typeof val === "object" && !(val instanceof File)) {
          Object.keys(val).forEach((subKey) => {
            const sub = val[subKey];
            if (sub !== null && sub !== undefined)
              formData.append(`${key}.${subKey}`, sub);
          });
        } else {
          formData.append(key, val);
        }
      });
      const response = await gemstoneAPI.updateGemstone(
        updateModal.gemstone._id,
        formData
      );
      if (response.success) {
        setSuccessMessage("Gemstone updated successfully!");
        closeUpdateModal();
        fetchGemstones();
        setTimeout(() => setSuccessMessage(""), 2500);
      } else {
        setError("Failed to update gemstone");
      }
    } catch (err) {
      console.error("Error updating gemstone:", err);
      setError(err.message || "Failed to update gemstone");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this gemstone?")) return;
    try {
      setLoading(true);
      const response = await gemstoneAPI.deleteGemstone(id);
      if (response.success) {
        setGemstones(gemstones.filter((g) => g._id !== id));
        setSuccessMessage("Gemstone deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 2500);
      } else {
        setError("Failed to delete gemstone");
      }
    } catch (err) {
      console.error("Error deleting gemstone:", err);
      setError(err.message || "Failed to delete gemstone");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setWeightFilter("");
    setBidFilter("");
    fetchGemstones();
  }

  function getStatusColor(status) {
    switch (status) {
      case "verified":
        return "bg-green-500 hover:bg-green-600";
      case "submitted":
      case "under_review":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      case "draft":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  }

  async function handleGenerateReport(data) {
    const confirmed = confirm(
      "Do you want to download the gemstones report as PDF?"
    );
    if (!confirmed) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const reportTitle = "Gemstones Report";
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 14, 22);
    doc.text(`Total items: ${data.length}`, 14, 27);
    autoTable(doc, {
      startY: 33,
      head: [["Name", "Category", "Weight", "Min Bid", "Status"]],
      body: data.map((g) => [
        g.name || "-",
        g.category || "-",
        g.weight ? `${g.weight} ${g.weightUnit || "carats"}` : "-",
        g.minimumBid != null ? `LKR ${g.minimumBid}` : "-",
        g.verificationStatus || "-",
      ]),
    });
    doc.save("gemstones_report.pdf");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gemstone Listings
          </h1>
          <p className="text-gray-600">Manage your gemstone auction listings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}
        {loading && (
          <div className="mb-6 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading gemstones...</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-2 flex-wrap items-center bg-white border rounded-xl p-3 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search gemstones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow"
            >
              <Search className="w-4 h-4" /> <span>Search</span>
            </button>
            <button
              onClick={() => handleGenerateReport(filteredGemstones)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors shadow"
              title="Download PDF report of current results"
            >
              Report Generation
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Filter by weight</option>
              {weightRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={bidFilter}
              onChange={(e) => setBidFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Filter by minimum bid</option>
              <option value="0-200000">LKR 0 - 200000</option>
              <option value="200000-500000">LKR 200000 - 500000</option>
              <option value="500000-1000000">LKR 500000 - 1000000</option>
              <option value="1000000+">LKR 1000000+</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Filter by status</option>
              <option value="verified">Verified</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mb-4 text-right text-sm text-gray-600">
          Showing {filteredGemstones.length} of {gemstones.length} items
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Certificate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Minimum Bid
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGemstones.length > 0 ? (
                  filteredGemstones.map((gemstone) => (
                    <tr
                      key={gemstone._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {gemstone._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {gemstone.images && gemstone.images.length > 0 ? (
                          <img
                            src={normalizeImageUrl(gemstone.images[0].url)}
                            alt={gemstone.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/64?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full"></div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs">
                          {gemstone.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 font-medium">
                          {gemstone.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {gemstone.weight} {gemstone.weightUnit || "carats"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {gemstone.dimensions && gemstone.dimensions.length ? (
                            <>
                              <div className="font-medium">
                                {gemstone.dimensions.length} ×{" "}
                                {gemstone.dimensions.width} ×{" "}
                                {gemstone.dimensions.height}{" "}
                                {gemstone.dimensions.unit || "mm"}
                              </div>
                              <div className="text-xs text-gray-500">
                                L × W × H
                              </div>
                            </>
                          ) : (
                            "Not specified"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {gemstone.certificateDetails &&
                          gemstone.certificateDetails.hasCertificate ? (
                            <div>
                              <div className="font-medium text-green-600">
                                Certified
                              </div>
                              <div className="text-xs text-gray-500">
                                {gemstone.certificateDetails.certifyingBody}
                              </div>
                              <div className="text-xs text-gray-500">
                                #{gemstone.certificateDetails.certificateNumber}
                              </div>
                            </div>
                          ) : (
                            "No Certificate"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {gemstone.minimumBid}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            gemstone.verificationStatus
                          )}`}
                        >
                          {gemstone.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdate(gemstone._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Update</span>
                          </button>
                          <button
                            onClick={() => handleDelete(gemstone._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm ||
                      selectedCategory ||
                      selectedStatus ||
                      weightFilter ||
                      bidFilter
                        ? "No gemstones match your search criteria."
                        : "No gemstones found. Add some gemstones using the listing form."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end text-sm text-gray-600">
          <div>
            Showing {filteredGemstones.length} of {gemstones.length}
          </div>
        </div>

        {updateModal.isOpen && (
          <UpdateModal
            gemstone={updateModal.gemstone}
            onClose={closeUpdateModal}
            onSubmit={handleUpdateSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Simplified Update Modal (name, category, minimumBid, weight, color, origin.country, description)
const UpdateModal = ({ gemstone, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: gemstone.name || "",
    description: gemstone.description || "",
    category: gemstone.category || "",
    minimumBid: gemstone.minimumBid || "",
    weight: gemstone.weight || "",
    color: gemstone.color || "",
    origin: {
      country: gemstone.origin?.country || "",
    },
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const submitData = {
      ...formData,
      minimumBid: formData.minimumBid
        ? parseFloat(formData.minimumBid)
        : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    };
    await onSubmit(submitData);
  }

  const categoriesList = [
    "Diamond",
    "Ruby",
    "Sapphire",
    "Emerald",
    "Topaz",
    "Garnet",
    "Amethyst",
    "Citrine",
    "Aquamarine",
    "Tourmaline",
    "Moonstone",
    "Peridot",
    "Opal",
    "Pearl",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Update Gemstone
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gemstone Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Bid *
                </label>
                <input
                  type="number"
                  name="minimumBid"
                  value={formData.minimumBid}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (carats)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Origin Country
                </label>
                <input
                  type="text"
                  name="origin.country"
                  value={formData.origin.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Gemstone"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GemstoneCRUDDisplay;
