import React, { useState, useEffect } from "react";
import {
  Eye,
  Check,
  X,
  Calendar,
  DollarSign,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { gemstoneAPI } from "../../../services/api";

export default function ListingApprovalsPage() {
  const [allGemstones, setAllGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectingGemstone, setRejectingGemstone] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionSuggestions, setRejectionSuggestions] = useState("");
  const [updateError, setUpdateError] = useState(null);
  const [selectedGemstone, setSelectedGemstone] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    async function fetchGemstones() {
      try {
        setLoading(true);
        setError(null);
        const data = await gemstoneAPI.getPendingGemstones();
        setAllGemstones(data.data.gemstones || []);
      } catch (err) {
        setError(err.message || "Failed to fetch gemstones");
      } finally {
        setLoading(false);
      }
    }
    fetchGemstones();
  }, []);

  // Separate gemstones by verification status
  const pendingGemstones = allGemstones.filter(
    (gem) =>
      gem.verificationStatus === "draft" ||
      gem.verificationStatus === "submitted"
  );
  const verifiedGemstones = allGemstones.filter(
    (gem) => gem.verificationStatus === "verified"
  );

  async function handleVerify(gemstoneId) {
    setProcessingId(gemstoneId);
    setUpdateError(null);
    try {
      await gemstoneAPI.verifyGemstone(gemstoneId, { verificationNotes: "" });
      setAllGemstones((prev) =>
        prev.map((gem) =>
          gem._id === gemstoneId
            ? {
                ...gem,
                verificationStatus: "verified",
                verifiedAt: new Date().toISOString(),
              }
            : gem
        )
      );
    } catch (err) {
      setUpdateError(err.message || "Failed to verify gemstone");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSubmit() {
    if (rejectionReason.trim().length < 10) {
      setUpdateError("Rejection reason must be at least 10 characters.");
      return;
    }
    setProcessingId(rejectingGemstone._id);
    setUpdateError(null);
    try {
      await gemstoneAPI.rejectGemstone(rejectingGemstone._id, {
        rejectionReason,
        suggestions: rejectionSuggestions,
      });
      setAllGemstones((prev) =>
        prev.filter((gem) => gem._id !== rejectingGemstone._id)
      );
      setRejectingGemstone(null);
      setRejectionReason("");
      setRejectionSuggestions("");
    } catch (err) {
      setUpdateError(err.message || "Failed to reject gemstone");
    } finally {
      setProcessingId(null);
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: {
        color: "bg-gray-100 text-gray-700",
        icon: Package,
        text: "Draft",
      },
      submitted: {
        color: "bg-yellow-100 text-yellow-700",
        icon: AlertCircle,
        text: "Submitted",
      },
      verified: {
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        text: "Verified",
      },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const GemstoneCard = ({ gem, showActions = true }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {gem.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {gem.description}
            </p>
            {getStatusBadge(gem.verificationStatus)}
          </div>
          <button
            onClick={() => setSelectedGemstone(gem)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors ml-2"
            title="View details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center">
            <Package className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600 truncate">{gem.category}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="font-semibold text-gray-900">
              {gem.minimumBid} {gem.currency}
            </span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600 truncate">
              {gem.sellerInfo?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">
              {new Date(gem.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              disabled={processingId === gem._id}
              onClick={() => handleVerify(gem._id)}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              {processingId === gem._id ? "Processing..." : "Verify"}
            </button>
            <button
              disabled={processingId === gem._id}
              onClick={() => setRejectingGemstone(gem)}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const PageHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Admin Dashboard</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  Listing Approvals
                </span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                Gemstone Listings
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and approve gemstone listings from sellers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingGemstones.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {verifiedGemstones.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Gemstones
        </h2>
        <p className="text-gray-600">
          Please wait while we fetch the latest data...
        </p>
      </div>
    </div>
  );

  const ErrorPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Data
        </h2>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {updateError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 font-medium">
                Error: {updateError}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-3 px-4 text-center rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === "pending"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Pending Approval</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === "pending"
                        ? "bg-blue-500 text-white"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {pendingGemstones.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("verified")}
                className={`flex-1 py-3 px-4 text-center rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === "verified"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === "verified"
                        ? "bg-blue-500 text-white"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {verifiedGemstones.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "pending" && (
          <div>
            {pendingGemstones.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-20">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No pending approvals
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  All gemstones have been processed or no new submissions have
                  been made yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {pendingGemstones.map((gem) => (
                  <GemstoneCard key={gem._id} gem={gem} showActions={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "verified" && (
          <div>
            {verifiedGemstones.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-20">
                <CheckCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No verified gemstones
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Verified gemstones will appear here once you approve pending
                  submissions.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {verifiedGemstones.map((gem) => (
                  <GemstoneCard key={gem._id} gem={gem} showActions={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reject Modal */}
        {rejectingGemstone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reject "{rejectingGemstone.name}"
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide a detailed reason for rejection (minimum 10 characters)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {rejectionReason.length}/10 characters minimum
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggestions for Improvement
                    </label>
                    <textarea
                      value={rejectionSuggestions}
                      onChange={(e) => setRejectionSuggestions(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional: Suggest improvements to help the seller resubmit successfully..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setRejectingGemstone(null);
                      setRejectionReason("");
                      setRejectionSuggestions("");
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={
                      processingId === rejectingGemstone._id ||
                      rejectionReason.trim().length < 10
                    }
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {processingId === rejectingGemstone._id
                      ? "Rejecting..."
                      : "Reject Listing"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gemstone Detail Modal */}
        {selectedGemstone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedGemstone.name}
                    </h3>
                    {getStatusBadge(selectedGemstone.verificationStatus)}
                  </div>
                  <button
                    onClick={() => setSelectedGemstone(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedGemstone.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Category
                        </h4>
                        <p className="text-gray-600">
                          {selectedGemstone.category}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Weight
                        </h4>
                        <p className="text-gray-600">
                          {selectedGemstone.weight}{" "}
                          {selectedGemstone.weightUnit}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Color
                        </h4>
                        <p className="text-gray-600">
                          {selectedGemstone.color}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Minimum Bid
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedGemstone.minimumBid}{" "}
                          {selectedGemstone.currency}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Submitted On
                        </h4>
                        <p className="text-gray-600">
                          {new Date(
                            selectedGemstone.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Seller Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">
                        {selectedGemstone.sellerInfo?.name}
                      </p>
                      <p className="text-gray-600">
                        {selectedGemstone.sellerInfo?.email}
                      </p>
                      {selectedGemstone.sellerInfo?.phone && (
                        <p className="text-gray-600">
                          {selectedGemstone.sellerInfo.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
