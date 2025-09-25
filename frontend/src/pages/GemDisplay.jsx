import React, { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { gemstoneAPI } from '../services/api';

const GemstoneCRUDDisplay = () => {
  // State for gemstones data from API
  const [gemstones, setGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [updateModal, setUpdateModal] = useState({ isOpen: false, gemstone: null });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [weightFilter, setWeightFilter] = useState('');
  const [bidFilter, setBidFilter] = useState('');

  // Categories list
  const categories = [
    'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Garnet',
    'Amethyst', 'Citrine', 'Aquamarine', 'Tourmaline', 'Moonstone',
    'Peridot', 'Opal', 'Pearl', 'Other'
  ];

  // Weight ranges
  const weightRanges = [
    { label: 'All Weights', value: '' },
    { label: '0-1 carats', value: '0-1' },
    { label: '1-2 carats', value: '1-2' },
    { label: '2-3 carats', value: '2-3' },
    { label: '3+ carats', value: '3+' }
  ];

  // Fetch gemstones from API
  useEffect(() => {
    fetchGemstones();
  }, []);

  const fetchGemstones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gemstoneAPI.getGemstones({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        minPrice: bidFilter ? bidFilter.split('-')[0] : undefined,
        maxPrice: bidFilter ? bidFilter.split('-')[1] : undefined,
        minWeight: weightFilter ? weightFilter.split('-')[0] : undefined,
        maxWeight: weightFilter ? weightFilter.split('-')[1] : undefined
      });
      
      if (response.success) {
        setGemstones(response.data.gemstones || []);
      } else {
        setError('Failed to fetch gemstones');
      }
    } catch (err) {
      console.error('Error fetching gemstones:', err);
      setError(err.message || 'Failed to fetch gemstones');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredGemstones = useMemo(() => {
    return gemstones.filter(gemstone => {
      const matchesSearch = searchTerm === '' || 
        gemstone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gemstone.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || gemstone.category === selectedCategory;
      const matchesStatus = selectedStatus === '' || gemstone.verificationStatus === selectedStatus;

      const matchesWeight = weightFilter === '' || (() => {
        const weight = parseFloat(gemstone.weight);
        switch (weightFilter) {
          case '0-1': return weight >= 0 && weight <= 1;
          case '1-2': return weight > 1 && weight <= 2;
          case '2-3': return weight > 2 && weight <= 3;
          case '3+': return weight > 3;
          default: return true;
        }
      })();

      const matchesBid = bidFilter === '' || (() => {
        const bid = parseFloat(gemstone.minimumBid);
        switch (bidFilter) {
          case '0-200': return bid >= 0 && bid <= 200;
          case '200-500': return bid > 200 && bid <= 500;
          case '500-1000': return bid > 500 && bid <= 1000;
          case '1000+': return bid > 1000;
          default: return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesStatus && matchesWeight && matchesBid;
    });
  }, [gemstones, searchTerm, selectedCategory, selectedStatus, weightFilter, bidFilter]);

  // KPIs derived from current filtered results
  const kpis = useMemo(() => {
    const total = filteredGemstones.length;
    const statuses = filteredGemstones.reduce((acc, g) => {
      const s = g.verificationStatus || 'unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const bids = filteredGemstones
      .map(g => Number(g.minimumBid))
      .filter(v => !isNaN(v));
    const avgBid = bids.length ? (bids.reduce((a, b) => a + b, 0) / bids.length) : 0;
    const minBid = bids.length ? Math.min(...bids) : 0;
    const maxBid = bids.length ? Math.max(...bids) : 0;
    return {
      total,
      verified: statuses['verified'] || 0,
      submitted: statuses['submitted'] || 0,
      under_review: statuses['under_review'] || 0,
      rejected: statuses['rejected'] || 0,
      draft: statuses['draft'] || 0,
      avgBid,
      minBid,
      maxBid
    };
  }, [filteredGemstones]);

  const handleSearch = () => {
    fetchGemstones();
  };

  // Generate PDF report of currently filtered gemstones
  const handleGenerateReport = async () => {
    const confirmed = window.confirm('Do you want to download the gemstones report as PDF?');
    if (!confirmed) return;
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const reportTitle = 'Gemstones Report';
      const generatedAt = new Date().toLocaleString();

      doc.setFontSize(16);
      doc.text(reportTitle, 14, 16);
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 14, 22);
      doc.text(`Total items: ${filteredGemstones.length}`, 14, 27);

      // KPI summary
      const kpiHead = [[
        'Total', 'Verified', 'Submitted', 'Under Review', 'Rejected', 'Draft', 'Avg Bid (LKR)', 'Min Bid (LKR)', 'Max Bid (LKR)'
      ]];
      const kpiBody = [[
        String(kpis.total),
        String(kpis.verified),
        String(kpis.submitted),
        String(kpis.under_review),
        String(kpis.rejected),
        String(kpis.draft),
        String(kpis.avgBid.toFixed(2)),
        String(kpis.minBid),
        String(kpis.maxBid)
      ]];
      autoTable(doc, {
        startY: 33,
        head: kpiHead,
        body: kpiBody,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129] } // emerald
      });

      const head = [[
        'Name',
        'Category',
        'Weight',
        'Min Bid',
        'Status'
      ]];

      const body = filteredGemstones.map(g => [
        g.name || '-',
        g.category || '-',
        (g.weight ? `${g.weight} ${g.weightUnit || 'carats'}` : '-'),
        (g.minimumBid != null ? `LKR ${g.minimumBid}` : '-'),
        g.verificationStatus || '-'
      ]);

      autoTable(doc, {
        startY: (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY + 6 : 33),
        head,
        body,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [31, 41, 55] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save('gemstones_report.pdf');
    } catch (err) {
      console.error('Report generation error:', err);
      window.alert('Failed to generate report. Please ensure dependencies are installed (npm i jspdf jspdf-autotable).');
    }
  };

  const handleUpdate = (id) => {
    const gemstone = gemstones.find(gem => gem._id === id);
    if (gemstone) {
      setUpdateModal({ isOpen: true, gemstone });
    }
  };

  const closeUpdateModal = () => {
    setUpdateModal({ isOpen: false, gemstone: null });
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          if (typeof updatedData[key] === 'object' && !Array.isArray(updatedData[key])) {
            Object.keys(updatedData[key]).forEach(subKey => {
              if (updatedData[key][subKey] !== null && updatedData[key][subKey] !== undefined) {
                formData.append(`${key}.${subKey}`, updatedData[key][subKey]);
              }
            });
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      });
      const response = await gemstoneAPI.updateGemstone(updateModal.gemstone._id, formData);
      if (response.success) {
        window.alert('🎉 Gemstone details updated successfully!');
        closeUpdateModal();
        fetchGemstones();
        window.location.reload();
      } else {
        setError('Failed to update gemstone');
        window.alert('❌ Failed to update gemstone. Please try again.');
      }
    } catch (err) {
      console.error('Error updating gemstone:', err);
      console.error('Error details:', err.response?.data);
      setError(err.message || 'Failed to update gemstone');
      let errorMessage = 'Failed to update gemstone. Please try again.';
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.message) errorMessage = err.message;
      window.alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gemstone?')) {
      try {
        setLoading(true);
        const response = await gemstoneAPI.deleteGemstone(id);
        if (response.success) {
          setSuccessMessage('Gemstone deleted successfully!');
          setGemstones(gemstones.filter(gem => gem._id !== id));
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError('Failed to delete gemstone');
        }
      } catch (err) {
        console.error('Error deleting gemstone:', err);
        setError(err.message || 'Failed to delete gemstone');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setWeightFilter('');
    setBidFilter('');
    fetchGemstones();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500 hover:bg-green-600';
      case 'submitted':
      case 'under_review':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'draft':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gemstone Listings</h1>
          <p className="text-gray-600">Manage your gemstone auction listings</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Gemstones</p>
            <p className="text-2xl font-bold text-gray-800">{kpis.total}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Verified</p>
            <p className="text-2xl font-bold text-green-600">{kpis.verified}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Avg Min Bid (LKR)</p>
            <p className="text-2xl font-bold text-gray-800">{kpis.avgBid.toFixed(2)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Range (LKR)</p>
            <p className="text-2xl font-bold text-gray-800">{kpis.minBid} - {kpis.maxBid}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading gemstones...</p>
          </div>
        )}

        {/* Search Bar with Button */}
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors shadow"
              title="Download PDF report of current results"
            >
              Report Generation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Weight Filter */}
            <select
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Filter by weight</option>
              {weightRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Bid Filter - LKR Only */}
            <select
              value={bidFilter}
              onChange={(e) => setBidFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Filter by minimum bid (LKR in lakhs)</option>
              <option value="0-200">LKR 0 - 200</option>
              <option value="200-500">LKR 200 - 500</option>
              <option value="500-1000">LKR 500 - 1000</option>
              <option value="1000+">LKR 1000+</option>
            </select>

            {/* Status Filter */}
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

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-right text-sm text-gray-600">
          Showing {filteredGemstones.length} of {gemstones.length} items
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Minimum Bid</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGemstones.length > 0 ? (
                  filteredGemstones.map((gemstone) => (
                    <tr key={gemstone._id} className="hover:bg-gray-50 transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{gemstone._id}</td>

                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {gemstone.images && gemstone.images.length > 0 ? (
                          <img
                            src={gemstone.images[0].url}
                            alt={gemstone.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full"></div>
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs">
                          {gemstone.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 font-medium">
                          {gemstone.category}
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {gemstone.weight} {gemstone.weightUnit || 'carats'}
                        </div>
                      </td>

                      {/* Dimensions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {gemstone.dimensions && gemstone.dimensions.length ? (
                            <>
                              <div className="font-medium">
                                {gemstone.dimensions.length} × {gemstone.dimensions.width} × {gemstone.dimensions.height} {gemstone.dimensions.unit || 'mm'}
                              </div>
                              <div className="text-xs text-gray-500">L × W × H</div>
                            </>
                          ) : (
                            <div className="text-gray-500">Not specified</div>
                          )}
                        </div>
                      </td>

                      {/* Certificate Details */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {gemstone.certificateDetails && gemstone.certificateDetails.hasCertificate ? (
                            <div>
                              <div className="font-medium text-green-600">Certified</div>
                              <div className="text-xs text-gray-500">
                                {gemstone.certificateDetails.certifyingBody}
                              </div>
                              <div className="text-xs text-gray-500">
                                #{gemstone.certificateDetails.certificateNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="font-medium text-gray-500">No Certificate</div>
                          )}
                        </div>
                      </td>

                      {/* Minimum Bid */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {gemstone.minimumBid}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(gemstone.verificationStatus)}`}>
                          {gemstone.verificationStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {/* Update Button */}
                          <button
                            onClick={() => handleUpdate(gemstone._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Update</span>
                          </button>

                          {/* Delete Button */}
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
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || selectedCategory || selectedStatus || weightFilter || bidFilter ? 
                        'No gemstones match your search criteria.' : 
                        'No gemstones found. Add some gemstones using the listing form.'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex justify-end text-sm text-gray-600">
          <div>Showing {filteredGemstones.length} of {gemstones.length}</div>
        </div>
      </div>

      {/* Update Modal */}
      {updateModal.isOpen && (
        <UpdateModal
          gemstone={updateModal.gemstone}
          onClose={closeUpdateModal}
          onSubmit={handleUpdateSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

// Update Modal Component
const UpdateModal = ({ gemstone, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: gemstone.name || '',
    description: gemstone.description || '',
    category: gemstone.category || '',
    minimumBid: gemstone.minimumBid || '',
    weight: gemstone.weight || '',
    color: gemstone.color || '',
    origin: {
      country: gemstone.origin?.country || '',
      region: gemstone.origin?.region || '',
      mine: gemstone.origin?.mine || '',
      yearMined: gemstone.origin?.yearMined || ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      minimumBid: parseFloat(formData.minimumBid),
      weight: formData.weight ? parseFloat(formData.weight) : undefined
    };
    await onSubmit(submitData);
  };

  const categories = [
    "Diamond", "Ruby", "Sapphire", "Emerald", "Topaz", "Garnet",
    "Amethyst", "Citrine", "Aquamarine", "Tourmaline", "Moonstone",
    "Peridot", "Opal", "Pearl", "Other"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-height-[90vh] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Update Gemstone</h2>
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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

              <div>
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
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {loading ? 'Updating...' : 'Update Gemstone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GemstoneCRUDDisplay;