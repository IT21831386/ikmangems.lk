import React, { useEffect, useState } from "react";
import {
  Gem,
  Clock,
  Eye,
  Star,
  TrendingUp,
  Gavel,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { gemstoneAPI } from "../../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable"; // import separately

const API_BASE = "http://localhost:5001/gemstone/auctions";

const AuctionPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [availableGems, setAvailableGems] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    gemId: "",
    startPrice: "",
    startTime: "",
    endTime: "",
  });
  const [bidAmount, setBidAmount] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchGems();
  }, []);

  const fetchBids = async (gemId) => {
    try {
      const bids = await gemstoneAPI.getBidsByGem(gemId);
      return bids; // array of bids
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      return [];
    }
  };

  async function fetchGems() {
    try {
      const response = await gemstoneAPI.getGemstones();
      const gemstones = response.data.gemstones;

      // Filter available gems for auction creation (isActive and not isAuctioned)
      const available = gemstones.filter(
        (gem) => gem.isActive && !gem.isAuctioned
      );
      setAvailableGems(available);

      // Map all gemstones to auction display format
      const mappedAuctions = gemstones.map((gem) => ({
        id: gem._id,
        gemId: gem._id,
        title: gem.name,
        description: gem.description,
        currentBid: gem.minimumBid,
        startingBid: gem.minimumBid,
        weight: `${gem.weight} ${gem.weightUnit}`,
        certification: gem.certificateDetails.hasCertificate
          ? gem.certificateDetails.certifyingBody
          : "No Certificate",
        location: gem.location || "Sri Lanka",
        views: gem.views || 0,
        features: gem.tags || [],
        seller: gem.sellerInfo.name,
        sellerRating: gem.sellerInfo.rating || 0,
        image: "http://localhost:5001/" + gem.primaryImage.replace(/\\/g, "/"),
        status: gem.isActive ? "active" : "inactive",
        category: gem.category,
        color: gem.color,
        currency: gem.currency || "LKR",
        isAuctioned: gem.isAuctioned,
        bidCount: gem.bidCount || 0,
        timeLeft: gem.timeLeft || Math.floor(Math.random() * 48) + 1,
      }));

      setAuctions(mappedAuctions);
    } catch (error) {
      console.error("Failed to fetch gemstones:", error);
    }
  }

  const handleCreateAuction = async () => {
    try {
      const res = await axios.post(API_BASE, formData);
      alert(res.data.message || "Auction created successfully!");
      setShowCreateModal(false);
      setFormData({ gemId: "", startPrice: "", startTime: "", endTime: "" });
      fetchGems(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Error creating auction");
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("ikmangems.lk - Gemstone Auctions Report", 40, 40);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 60);

    // Table columns
    const tableColumn = [
      "Title",
      "Category",
      "Weight",
      "Current Bid",
      "Seller",
      "Bid Count",
      "Time Left (h)",
      "Color",
      "Location",
      "Certification",
    ];

    // Table rows
    const tableRows = auctions.map((auction) => [
      auction.title,
      auction.category,
      auction.weight,
      `${auction.currency} ${auction.currentBid.toLocaleString()}`,
      auction.seller,
      auction.bidCount,
      auction.timeLeft,
      auction.color,
      auction.location,
      auction.certification,
    ]);

    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 40, right: 40 },
      theme: "striped",
    });

    // Save PDF
    doc.save("ikmangems_auctions_report.pdf");
  };

  const viewAuction = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      let auction = res.data.auction;

      // Fetch bids for this gem
      const bids = await fetchBids(auction.gemId || auction.id);

      setSelectedAuction({
        ...auction,
        bids: bids, // add all bids
        bidCount: bids.length, // update bid count dynamically
      });
    } catch (err) {
      // fallback: find auction locally
      const auction = auctions.find((a) => a.id === id);
      if (auction) {
        const bids = await fetchBids(auction.gemId || auction.id);
        setSelectedAuction({ ...auction, bids, bidCount: bids.length });
      } else {
        alert("Error fetching auction details");
      }
    }
  };

  const placeBid = async () => {
    if (!selectedAuction) return;
    if (!bidAmount || parseFloat(bidAmount) <= selectedAuction.currentBid) {
      alert("Bid must be higher than current bid");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/${selectedAuction._id || selectedAuction.id}/bid`,
        {
          amount: bidAmount,
        }
      );
      alert(res.data.message || "Bid placed successfully!");
      setBidAmount("");
      viewAuction(selectedAuction._id || selectedAuction.id);
    } catch (err) {
      alert(err.response?.data?.message || "Error placing bid");
    }
  };

  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const filteredAuctions = auctions.filter((auction) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return auction.status === "active" && auction.timeLeft > 0;
    if (activeTab === "ending") return auction.timeLeft <= 6;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gemstone Auctions
                </h1>
              </div>
            </div>
            <button
              onClick={downloadReport}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Download Report
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-500 px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Auction
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm w-fit">
          {[
            { id: "all", label: "All Auctions" },
            { id: "active", label: "Active" },
            { id: "ending", label: "Ending Soon" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Gem className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No auctions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => viewAuction(auction.id)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover:scale-105"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-lg">
                      {auction.category}
                    </span>
                    {auction.timeLeft <= 6 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                        Ending Soon
                      </span>
                    )}
                    {!auction.isAuctioned && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Not Auctioned
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Eye className="w-3.5 h-3.5" />
                      {auction.views}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {auction.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {auction.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(auction.currentBid, auction.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Weight</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {auction.weight}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{auction.timeLeft}h left</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{auction.bidCount} bids</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {auction.seller.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Seller</p>
                        <p className="text-sm font-medium text-gray-700">
                          {auction.seller}
                        </p>
                      </div>
                    </div>
                    {auction.sellerRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          {auction.sellerRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auction Detail Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Auction Details
              </h2>
              <button
                onClick={() => setSelectedAuction(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedAuction.image}
                    alt={selectedAuction.title}
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                  />
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedAuction.title}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedAuction.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {selectedAuction.certification}
                    </span>
                    {!selectedAuction.isAuctioned && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        Not Auctioned
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-6">
                    {selectedAuction.description}
                  </p>

                  {selectedAuction.bids && selectedAuction.bids.length > 0 && (
                    <div className="bg-gray-50 border rounded-xl p-4 mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Bids Placed
                      </h4>
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedAuction.bids.map((bid, index) => (
                          <li
                            key={index}
                            className="flex justify-between text-sm text-gray-700 border-b pb-1"
                          >
                            <span>Bidder: {bid.userName || bid.user}</span>
                            <span>
                              {selectedAuction.currency} {bid.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-white border rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Gemstone Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Weight</p>
                        <p className="font-medium text-gray-900">
                          {selectedAuction.weight}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Color</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {selectedAuction.color}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedAuction.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Certificate</p>
                        <p className="font-medium text-gray-900">
                          {selectedAuction.certification}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!selectedAuction.isAuctioned && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        This gemstone is not currently available for auction.
                        Create an auction to start bidding!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Auction
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Gemstone
                </label>
                <div className="relative">
                  <select
                    value={formData.gemId}
                    onChange={(e) =>
                      setFormData({ ...formData, gemId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white"
                  >
                    <option value="">Choose a gemstone...</option>
                    {availableGems.map((gem) => (
                      <option key={gem._id} value={gem._id}>
                        {gem.name} - {gem.weight} {gem.weightUnit} -{" "}
                        {gem.currency} {gem.minimumBid}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {availableGems.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    No gemstones available for auction. All active gems are
                    already auctioned.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price
                </label>
                <input
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, startPrice: e.target.value })
                  }
                  placeholder="Enter starting price"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleCreateAuction}
                disabled={!formData.gemId || availableGems.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Create Auction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionPage;
