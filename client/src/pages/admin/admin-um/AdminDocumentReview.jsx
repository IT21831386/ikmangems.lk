import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Loader, Eye, User, Calendar, AlertCircle, FileText, Building2, Shield } from "lucide-react";

const AdminDocumentReview = () => {
  const [pendingNIC, setPendingNIC] = useState([]);
  const [pendingBusiness, setPendingBusiness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null); // 'nic' or 'business'
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [activeTab, setActiveTab] = useState("nic");

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      // Fetch both NIC and Business pending verifications
      const [nicResponse, businessResponse] = await Promise.all([
        axios.get("http://localhost:5001/api/nic/pending", { withCredentials: true }),
        axios.get("http://localhost:5001/api/business/pending", { withCredentials: true })
      ]);

      if (nicResponse.data.success) {
        setPendingNIC(nicResponse.data.data);
      }
      if (businessResponse.data.success) {
        setPendingBusiness(businessResponse.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch pending verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, status, documentType) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      setNotification({ type: "error", message: "Please provide a rejection reason." });
      return;
    }

    status === "approved" ? setApproveLoading(true) : setRejectLoading(true);

    try {
      const endpoint = documentType === 'nic' 
        ? "http://localhost:5001/api/nic/update-status"
        : "http://localhost:5001/api/business/update-status";

      const response = await axios.post(
        endpoint,
        {
          userId,
          status,
          rejectionReason: status === "rejected" ? rejectionReason : null,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        // Remove the user from the appropriate pending list
        if (documentType === 'nic') {
          setPendingNIC(prev => prev.filter((u) => u._id !== userId));
        } else {
          setPendingBusiness(prev => prev.filter((u) => u._id !== userId));
        }
        
        setSelectedUser(null);
        setSelectedDocumentType(null);
        setRejectionReason("");
        setNotification({ type: "success", message: `${documentType.toUpperCase()} ${status} successfully!` });
      } else {
        setNotification({ type: "error", message: response.data.message || "Failed to update status" });
      }
    } catch (err) {
      console.error("Update status error:", err);
      setNotification({ type: "error", message: "Server error. Please try again." });
    } finally {
      setApproveLoading(false);
      setRejectLoading(false);
    }
  };

  const openUserModal = (user, documentType) => {
    setSelectedUser(user);
    setSelectedDocumentType(documentType);
    setRejectionReason("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalPending = pendingNIC.length + pendingBusiness.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Verification Review</h1>
          <p className="text-gray-600 mt-2">
            Review and approve pending identity and business document verifications
          </p>
          <div className="mt-4 flex gap-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Total Pending: {totalPending}
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              NIC: {pendingNIC.length}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Business: {pendingBusiness.length}
            </div>
          </div>
        </div>

        {notification.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-700" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("nic")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "nic"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                NIC Verifications ({pendingNIC.length})
              </button>
              <button
                onClick={() => setActiveTab("business")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "business"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Business Verifications ({pendingBusiness.length})
              </button>
            </nav>
          </div>
        </div>

        {totalPending === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Verifications</h3>
            <p className="text-gray-600">All document verifications have been processed.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === "nic" ? "Pending NIC Requests" : "Pending Business Requests"} 
                ({activeTab === "nic" ? pendingNIC.length : pendingBusiness.length})
              </h2>
              
              {(activeTab === "nic" ? pendingNIC : pendingBusiness).map((user) => (
                <div
                  key={user._id}
                  onClick={() => openUserModal(user, activeTab)}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedUser?._id === user._id && selectedDocumentType === activeTab
                      ? "ring-2 ring-blue-500 shadow-md"
                      : "shadow"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeTab === "nic" ? (
                        <Shield className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Submitted: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-6 lg:self-start">
              {selectedUser && selectedDocumentType ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.nicStatus)}`}>
                        NIC: {selectedUser.nicStatus}
                      </span>
                      {selectedUser.businessStatus && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(selectedUser.businessStatus)}`}>
                          Business: {selectedUser.businessStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {selectedDocumentType === "nic" ? (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">NIC Front Side</h3>
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={selectedUser.nicFrontImage}
                              alt="NIC Front"
                              className="w-full h-64 object-contain bg-gray-50"
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">NIC Back Side</h3>
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={selectedUser.nicBackImage}
                              alt="NIC Back"
                              className="w-full h-64 object-contain bg-gray-50"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Business Documents</h3>
                        <div className="space-y-2">
                          {selectedUser.businessDocs?.map((doc, index) => (
                            <div key={index} className="border rounded-lg p-3 flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Document {index + 1}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.split('/').pop()}
                                </p>
                              </div>
                              <a
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedUser._id, "approved", selectedDocumentType)}
                      disabled={approveLoading || rejectLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {approveLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" />Approve</>}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedUser._id, "rejected", selectedDocumentType)}
                      disabled={approveLoading || rejectLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {rejectLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><X className="w-5 h-5" />Reject</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a User</h3>
                  <p className="text-gray-600">Click on a user from the list to review their documents</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentReview;
