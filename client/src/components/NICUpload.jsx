import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Check, X, AlertCircle, Loader } from 'lucide-react';

const NICUpload = ({ onSuccess }) => {
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [nicFrontPreview, setNicFrontPreview] = useState(null);
  const [nicBackPreview, setNicBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nicStatus, setNicStatus] = useState(null);

  useEffect(() => {
    fetchNICStatus();
  }, []);

  // ✅ Fetch NIC Status (Axios version)
  const fetchNICStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/nic/status', {
        withCredentials: true,
      });

      if (response.data?.success) {
        const data = response.data.data;
        setNicStatus(data.nicStatus);
        if (data.nicFrontImage) setNicFrontPreview(data.nicFrontImage);
        if (data.nicBackImage) setNicBackPreview(data.nicBackImage);
      }
    } catch (err) {
      console.error('Failed to fetch NIC status:', err);
      if (err.response) {
        console.error('Server error:', err.response.status, err.response.data);
      } else {
        console.error('Network error:', err.message);
      }
    }
  };

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setError('Only JPEG, JPG, and PNG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setNicFront(file);
          setNicFrontPreview(reader.result);
        } else {
          setNicBack(file);
          setNicBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // ✅ Upload NIC (Axios version)
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!nicFront || !nicBack) {
      setError('Please upload both front and back images of your NIC');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nicFront', nicFront);
      formData.append('nicBack', nicBack);

      const response = await axios.post(
        'http://localhost:5001/api/nic/upload',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data?.success) {
        setSuccess('NIC images uploaded successfully! Awaiting admin approval.');
        setNicStatus('pending');
        if (onSuccess) onSuccess();
      } else {
        setError(response.data?.message || 'Failed to upload NIC images');
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
    if (!nicStatus) return null;

    const statusConfig = {
      not_uploaded: { color: 'bg-gray-100 text-gray-700', text: 'Not Uploaded' },
      pending: { color: 'bg-yellow-100 text-yellow-700', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-700', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', text: 'Rejected' },
    };

    const config = statusConfig[nicStatus];

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        {nicStatus === 'approved' && <Check className="w-4 h-4" />}
        {nicStatus === 'pending' && <Loader className="w-4 h-4 animate-spin" />}
        {nicStatus === 'rejected' && <X className="w-4 h-4" />}
        {config.text}
      </div>
    );
  };

  const isApproved = nicStatus === 'approved';
  const isPending = nicStatus === 'pending';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
          <StatusBadge />
        </div>

        <p className="text-gray-600 mb-6">
          Upload clear photos of your NIC (National Identity Card), Passport, or Driver's License
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

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✓ Your identity has been verified! You can proceed to the next step.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Front Side Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Front Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              {nicFrontPreview ? (
                <div className="relative">
                  <img
                    src={nicFrontPreview}
                    alt="NIC Front"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {!isApproved && !isPending && (
                    <button
                      onClick={() => {
                        setNicFront(null);
                        setNicFrontPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-48">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'front')}
                    className="hidden"
                    disabled={isApproved || isPending}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Back Side Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              {nicBackPreview ? (
                <div className="relative">
                  <img
                    src={nicBackPreview}
                    alt="NIC Back"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {!isApproved && !isPending && (
                    <button
                      onClick={() => {
                        setNicBack(null);
                        setNicBackPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-48">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'back')}
                    className="hidden"
                    disabled={isApproved || isPending}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Important Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure all text is clearly readable</li>
            <li>• Photo should be well-lit with no glare</li>
            <li>• All corners of the document must be visible</li>
            <li>• File size should not exceed 5MB</li>
          </ul>
        </div>

        {!isApproved && !isPending && (
          <button
            onClick={handleSubmit}
            disabled={loading || !nicFront || !nicBack}
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
                Upload for Verification
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default NICUpload;
