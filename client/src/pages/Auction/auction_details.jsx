import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  Clock,
  Star,
  Shield,
  Award,
  MapPin,
  Gem,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Gavel,
  Users,
  Zap,
  Info,
  MessageCircle,
  History,
  BookOpen,
  Maximize2,
} from "lucide-react";

const GemDetailPage = ({ gemId = 1, onBack }) => {
  const navigate = useNavigate();

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeLeft, setTimeLeft] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);

  // Mock gem data (in real app, this would come from API based on gemId)
  const gemData = {
    id: 1,
    title: "Exceptional Ceylon Blue Sapphire",
    category: "Sapphire",
    currentBid: 15750,
    startingBid: 8500,
    reservePrice: 18000,
    nextBidIncrement: 500,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000),
    bidCount: 23,
    views: 456,
    watchers: 89,
    location: "Colombo",
    seller: {
      name: "Merit Gems Lanka",
      rating: 4.9,
      totalSales: "1.2M",
      yearsActive: 8,
      verified: true,
      avatar: "MGL",
    },
    certification: {
      lab: "GIA",
      number: "GIA-2118234567",
      date: "2024-01-15",
    },
    specifications: {
      weight: "5.42 ct",
      dimensions: "11.2 x 9.8 x 6.4 mm",
      shape: "Oval",
      cut: "Excellent",
      color: "Royal Blue",
      clarity: "VVS1",
      origin: "Ceylon (Sri Lanka)",
      treatment: "No Heat",
    },
    features: [
      "Natural",
      "Unheated",
      "Eye Clean",
      "Cornflower Blue",
      "Excellent Cut",
    ],
    description:
      "This exceptional Ceylon blue sapphire exhibits the coveted cornflower blue color that has made Sri Lankan sapphires world-renowned. The stone displays excellent transparency with remarkable brilliance and fire. Sourced from the famous Ratnapura mines, this unheated natural sapphire represents the pinnacle of Ceylon's gem heritage.",
    image: "/images/auction-gems/1.jpg",
    images: [
      "/images/auction-gems/1.jpg",
      "/images/auction-gems/2.png",
      "/images/auction-gems/3.jpg",
      "/images/auction-gems/4.jpg",
    ],
    bidHistory: [
      {
        bidder: "B****r",
        amount: 15750,
        time: "2 minutes ago",
        isWinning: true,
      },
      {
        bidder: "G****s",
        amount: 15250,
        time: "5 minutes ago",
        isWinning: false,
      },
      {
        bidder: "S****e",
        amount: 14800,
        time: "12 minutes ago",
        isWinning: false,
      },
      {
        bidder: "B****r",
        amount: 14300,
        time: "18 minutes ago",
        isWinning: false,
      },
      {
        bidder: "C****l",
        amount: 13750,
        time: "25 minutes ago",
        isWinning: false,
      },
    ],
    relatedGems: [
      {
        id: 2,
        title: "Blue Sapphire 4.2ct",
        price: 12500,
        image:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzM2NjZGMSIvPjwvc3ZnPg==",
      },
      {
        id: 3,
        title: "Ceylon Sapphire 3.8ct",
        price: 18900,
        image:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzYzNjZGMSIvPjwvc3ZnPg==",
      },
    ],
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = gemData.endTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gemData.endTime]);

  // Handle bid submission
  const handleBidSubmission = () => {
    const bidValue = parseFloat(bidAmount);
    if (bidValue >= gemData.currentBid + gemData.nextBidIncrement) {
      // Here you would submit the bid to your API
      console.log(`Bid submitted: $${bidValue}`);
      setShowBidModal(false);
      setBidAmount("");
      // Update current bid (in real app, this would come from API response)
      gemData.currentBid = bidValue;
      gemData.bidCount += 1;
    }
  };

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gemData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + gemData.images.length) % gemData.images.length
    );
  };

  // Bid Modal Component
  const BidModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Place Your Bid</h3>
          <button
            onClick={() => setShowBidModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Current Bid</span>
              <span className="text-lg font-bold text-gray-900">
                ${gemData.currentBid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Minimum Next Bid</span>
              <span className="text-sm font-medium text-blue-600">
                $
                {(
                  gemData.currentBid + gemData.nextBidIncrement
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                LKR
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={(
                  gemData.currentBid + gemData.nextBidIncrement
                ).toString()}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            {bidAmount &&
              parseFloat(bidAmount) <
                gemData.currentBid + gemData.nextBidIncrement && (
                <p className="text-red-500 text-sm mt-2">
                  Bid must be at least $
                  {(
                    gemData.currentBid + gemData.nextBidIncrement
                  ).toLocaleString()}
                </p>
              )}
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Bidding Agreement</p>
                <p>
                  By placing this bid, you agree to purchase this item if you
                  win.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowBidModal(false)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBidSubmission}
              disabled={
                !bidAmount ||
                parseFloat(bidAmount) <
                  gemData.currentBid + gemData.nextBidIncrement
              }
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Place Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Image Modal Component
  const ImageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-full p-4">
        <button
          onClick={() => setShowImageModal(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <ArrowLeft size={24} />
        </button>
        <img
          src={gemData.images[currentImageIndex]}
          alt={`${gemData.title} - Image ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        {gemData.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const handleBackToAuction = () => {
    // Navigate to the bid page for this gem
    navigate(`/auction`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAuction}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Auctions
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <nav className="text-sm">
                <span className="text-gray-500">Auctions</span>
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-gray-900">{gemData.category}</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Share2 size={20} />
              </button>
              <button
                onClick={() => setIsWatching(!isWatching)}
                className={`p-2 rounded-lg transition-colors ${
                  isWatching
                    ? "text-red-500 bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Heart size={20} fill={isWatching ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-w-4 aspect-h-3">
                <img
                  src={gemData.images[currentImageIndex]}
                  alt={`${gemData.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70"
                >
                  <Maximize2 size={16} />
                </button>
                {gemData.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {gemData.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {gemData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="mt-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: "overview", label: "Overview", icon: BookOpen },
                  {
                    key: "specifications",
                    label: "Specifications",
                    icon: Info,
                  },
                  { key: "bidhistory", label: "Bid History", icon: History },
                  { key: "seller", label: "Seller Info", icon: User },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {gemData.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {gemData.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(gemData.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-gray-100"
                          >
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="font-medium text-gray-900">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle
                          className="text-green-600 mt-0.5"
                          size={20}
                        />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Certification Details
                          </h4>
                          <p className="text-green-700 text-sm">
                            {gemData.certification.lab} Certificate #
                            {gemData.certification.number}
                          </p>
                          <p className="text-green-600 text-xs">
                            Issued: {gemData.certification.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "bidhistory" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Bid Activity
                    </h3>
                    <div className="space-y-3">
                      {gemData.bidHistory.map((bid, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                            bid.isWinning
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {bid.bidder}
                              </p>
                              <p className="text-sm text-gray-500">
                                {bid.time}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${bid.amount.toLocaleString()}
                            </p>
                            {bid.isWinning && (
                              <p className="text-xs text-green-600 font-medium">
                                Winning Bid
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "seller" && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {gemData.seller.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {gemData.seller.name}
                          </h3>
                          {gemData.seller.verified && (
                            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                              <Shield size={14} className="text-green-600" />
                              <span className="text-green-700 text-xs font-medium">
                                Verified
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-400" />
                            <span>{gemData.seller.rating}/5</span>
                          </div>
                          <div>
                            Total Sales: LKR {gemData.seller.totalSales}
                          </div>
                          <div>{gemData.seller.yearsActive} years active</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageCircle size={16} />
                        <span>Contact Seller</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={16} />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Auction Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {gemData.title}
                  </h1>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{gemData.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{gemData.watchers} watching</span>
                    </div>
                  </div>
                </div>

                {/* Time Left */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="text-orange-600" size={16} />
                    <span className="text-orange-800 font-medium">
                      Auction Ending
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Days", value: timeLeft.days || 0 },
                      { label: "Hours", value: timeLeft.hours || 0 },
                      { label: "Min", value: timeLeft.minutes || 0 },
                      { label: "Sec", value: timeLeft.seconds || 0 },
                    ].map((time) => (
                      <div key={time.label} className="bg-white rounded p-2">
                        <div className="text-lg font-bold text-gray-900">
                          {time.value.toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-gray-600">
                          {time.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Bid */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    LKR {gemData.currentBid.toLocaleString()}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>
                      Starting: LKR {gemData.startingBid.toLocaleString()}
                    </span>
                    <span>{gemData.bidCount} bids</span>
                  </div>

                  {/* Bid Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          ((gemData.currentBid - gemData.startingBid) /
                            (gemData.reservePrice - gemData.startingBid)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Reserve Price: ${gemData.reservePrice.toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Gavel size={20} />
                    <span>Place Bid</span>
                  </button>

                  <button
                    onClick={() => setIsWatching(!isWatching)}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                      isWatching
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isWatching ? "Remove from Watchlist" : "Add to Watchlist"}
                  </button>
                </div>

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Gem size={14} className="text-blue-600" />
                      <span className="text-gray-600">
                        {gemData.specifications.weight}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award size={14} className="text-green-600" />
                      <span className="text-gray-600">
                        {gemData.certification.lab}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-orange-600" />
                      <span className="text-gray-600">{gemData.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp size={14} className="text-purple-600" />
                      <span className="text-gray-600">
                        {gemData.specifications.treatment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Quick Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Seller Information
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {gemData.seller.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {gemData.seller.name}
                      </p>
                      {gemData.seller.verified && (
                        <Shield size={14} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star size={12} className="text-yellow-400" />
                      <span>{gemData.seller.rating}/5</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">
                      ${gemData.seller.totalSales}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Years Active:</span>
                    <span className="font-medium">
                      {gemData.seller.yearsActive} years
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Gems */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Similar Gems
                </h3>
                <div className="space-y-4">
                  {gemData.relatedGems.map((gem) => (
                    <div
                      key={gem.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={gem.image}
                        alt={gem.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {gem.title}
                        </p>
                        <p className="text-green-600 font-semibold">
                          ${gem.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBidModal && <BidModal />}
      {showImageModal && <ImageModal />}
    </div>
  );
};

export default GemDetailPage;
