import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Check, X, AlertCircle, Loader, FileText, Building2 } from 'lucide-react';

const BusinessUpload = ({ onSuccess }) => {
  const [businessDocs, setBusinessDocs] = useState([]);
  const [businessStatus, setBusinessStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchBusinessStatus();
  }, []);

  const fetchBusinessStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/business/status', {
        withCredentials: true,
      });

      if (response.data?.success) {
        const data = response.data.data;
        setBusinessStatus(data.businessStatus);
        setBusinessDocs(data.businessDocs || []);
        setRejectionReason(data.rejectionReason || '');
      }
    } catch (err) {
      console.error('Failed to fetch business status:', err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    for (const file of files) {
      if (!file.type.match('image/(jpeg|jpg|png)|application/pdf')) {
        setError('Only JPEG, JPG, PNG, and PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
    }

    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }

    setBusinessDocs(files);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (businessDocs.length === 0) {
      setError('Please upload at least one business document');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      businessDocs.forEach((file, index) => {
        formData.append(`businessDoc${index}`, file);
      });

      const response = await axios.post(
        'http://localhost:5001/api/business/upload',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data?.success) {
        setSuccess('Business documents uploaded successfully! Awaiting admin approval.');
        setBusinessStatus('pending');
        if (onSuccess) onSuccess();
      } else {
        setError(response.data?.message || 'Failed to upload business documents');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = () => {
    if (!businessStatus) return null;

    const statusConfig = {
      not_uploaded: { color: 'bg-gray-100 text-gray-700', text: 'Not Uploaded' },
      pending: { color: 'bg-yellow-100 text-yellow-700', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-700', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', text: 'Rejected' },
      skipped: { color: 'bg-purple-100 text-purple-700', text: 'Skipped' },
    };

    const config = statusConfig[businessStatus];

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        {businessStatus === 'approved' && <Check className="w-4 h-4" />}
        {businessStatus === 'pending' && <Loader className="w-4 h-4 animate-spin" />}
        {businessStatus === 'rejected' && <X className="w-4 h-4" />}
        {businessStatus === 'skipped' && <Building2 className="w-4 h-4" />}
        {config.text}
      </div>
    );
  };

  const isApproved = businessStatus === 'approved';
  const isPending = businessStatus === 'pending';
  const isRejected = businessStatus === 'rejected';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Business Registration Verification</h2>
          <StatusBadge />
        </div>

        <p className="text-gray-600 mb-6">
          Upload your business registration documents, tax certificates, or other relevant business documents
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {isRejected && rejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Rejection Reason:</h4>
            <p className="text-red-700 text-sm">{rejectionReason}</p>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✓ Your business documents have been verified! You can proceed to the next step.
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Documents (Upload multiple files)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload business documents</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB each (Max 5 files)</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                multiple
                className="hidden"
                disabled={isApproved || isPending}
              />
            </label>
          </div>
        </div>

        {businessDocs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
            <div className="space-y-2">
              {businessDocs.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  {!isApproved && !isPending && (
                    <button
                      onClick={() => {
                        const newDocs = businessDocs.filter((_, i) => i !== index);
                        setBusinessDocs(newDocs);
                      }}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Accepted Documents:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Business Registration Certificate</li>
            <li>• Tax Registration Certificate</li>
            <li>• Trade License</li>
            <li>• Partnership Deed (if applicable)</li>
            <li>• Company Incorporation Certificate</li>
            <li>• Any other relevant business documents</li>
          </ul>
        </div>

        {!isApproved && !isPending && (
          <button
            onClick={handleSubmit}
            disabled={loading || businessDocs.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {isRejected ? 'Resubmit Business Documents' : 'Upload for Verification'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessUpload;


