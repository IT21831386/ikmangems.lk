/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Filter,
  Heart,
  Clock,
  Eye,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  MapPin,
  Gem,
  Calendar,
  DollarSign,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";
import { gemstoneAPI } from "../../services/api";

const GemsAuctionPage = () => {
  // State Management
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("ending_soon");
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [selectedGems, setSelectedGems] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    certification: true,
    location: true,
    features: false,
  });

  // Mock auction data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const auctions = [
  //   {
  //     id: 1,
  //     title: "Exceptional Ceylon Blue Sapphire",
  //     category: "Sapphire",
  //     currentBid: 15750,
  //     startingBid: 8500,
  //     timeLeft: "2h 45m",
  //     endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  //     bidCount: 23,
  //     views: 456,
  //     location: "Colombo",
  //     seller: "Merit Gems Lanka",
  //     sellerRating: 4.9,
  //     certification: "GIA",
  //     weight: "5.42 ct",
  //     image: "/images/auction-gems/1.jpg",
  //     features: ["Natural", "Unheated", "Eye Clean"],
  //     status: "active",
  //   },
  //   {
  //     id: 2,
  //     title: "Rare Padparadscha Sapphire",
  //     category: "Sapphire",
  //     currentBid: 28900,
  //     startingBid: 12000,
  //     timeLeft: "1d 3h",
  //     endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
  //     bidCount: 41,
  //     views: 789,
  //     location: "Ratnapura",
  //     seller: "Ceylon Gem Palace",
  //     sellerRating: 4.8,
  //     certification: "SSEF",
  //     weight: "3.85 ct",
  //     image: "/images/auction-gems/2.png",
  //     features: ["Natural", "Heated", "Premium Cut"],
  //     status: "hot",
  //   },
  //   {
  //     id: 3,
  //     title: "Vivid Red Ruby - Burma Origin",
  //     category: "Ruby",
  //     currentBid: 45200,
  //     startingBid: 25000,
  //     timeLeft: "5h 12m",
  //     endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
  //     bidCount: 67,
  //     views: 1234,
  //     location: "Kandy",
  //     seller: "Royal Gems Collection",
  //     sellerRating: 5.0,
  //     certification: "Gübelin",
  //     weight: "2.14 ct",
  //     image: "/images/auction-gems/3.jpg",
  //     features: ["Natural", "Unheated", "Pigeon Blood"],
  //     status: "ending_soon",
  //   },
  //   {
  //     id: 4,
  //     title: "Alexandrite Color-Change Gem",
  //     category: "Alexandrite",
  //     currentBid: 18650,
  //     startingBid: 9500,
  //     timeLeft: "3d 8h",
  //     endTime: new Date(Date.now() + 80 * 60 * 60 * 1000),
  //     bidCount: 19,
  //     views: 332,
  //     location: "Galle",
  //     seller: "Tropical Gems Ltd",
  //     sellerRating: 4.7,
  //     certification: "AGL",
  //     weight: "1.95 ct",
  //     image: "/images/auction-gems/4.jpg",
  //     features: ["Natural", "Color Change", "Russian Origin"],
  //     status: "active",
  //   },
  //   {
  //     id: 5,
  //     title: "Cat's Eye Chrysoberyl",
  //     category: "Chrysoberyl",
  //     currentBid: 12300,
  //     startingBid: 6800,
  //     timeLeft: "6h 30m",
  //     endTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000),
  //     bidCount: 15,
  //     views: 267,
  //     location: "Ratnapura",
  //     seller: "Heritage Gems",
  //     sellerRating: 4.6,
  //     certification: "GRS",
  //     weight: "4.12 ct",
  //     image: "/images/auction-gems/5.jpg",
  //     features: ["Natural", "Sharp Eye", "Honey Color"],
  //     status: "active",
  //   },
  //   {
  //     id: 6,
  //     title: "Pink Spinel Octagonal Cut",
  //     category: "Spinel",
  //     currentBid: 8950,
  //     startingBid: 4200,
  //     timeLeft: "12h 15m",
  //     endTime: new Date(Date.now() + 12.25 * 60 * 60 * 1000),
  //     bidCount: 28,
  //     views: 423,
  //     location: "Colombo",
  //     seller: "Island Treasures",
  //     sellerRating: 4.5,
  //     certification: "LOTUS",
  //     weight: "3.67 ct",
  //     image: "/images/auction-gems/6.jpg",
  //     features: ["Natural", "No Heat", "Vivid Pink"],
  //     status: "active",
  //   },
  // ];

  // Filter options
  const categories = [
    "Sapphire",
    "Ruby",
    "Emerald",
    "Alexandrite",
    "Chrysoberyl",
    "Spinel",
    "Garnet",
    "Tourmaline",
  ];
  const certifications = [
    "GIA",
    "SSEF",
    "Gübelin",
    "AGL",
    "GRS",
    "LOTUS",
    "NGJA",
    "GTC",
  ];
  const locations = [
    "Colombo",
    "Ratnapura",
    "Kandy",
    "Galle",
    "Matara",
    "Badulla",
  ];
  // eslint-disable-next-line no-unused-vars
  const features = [
    "Natural",
    "Unheated",
    "Heated",
    "Eye Clean",
    "Color Change",
    "Star Effect",
    "Cat's Eye",
  ];

  const [auctions, setAuctions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch auctions from API
  useEffect(() => {
    async function fetchGems() {
      try {
        const response = await gemstoneAPI.getGemstones();
        const gemstones = response.data.gemstones;

        // Filter gems that are active and already auctioned
        const filteredGems = gemstones.filter(
          (gem) => gem.isActive && gem.isAuctioned
        );

        const mappedAuctions = filteredGems.map((gem) => ({
          id: gem._id,
          title: gem.name,
          description: gem.description,
          currentBid: gem.minimumBid,
          startingBid: gem.minimumBid,
          weight: `${gem.weight} ${gem.weightUnit}`,
          certification: gem.certificateDetails.hasCertificate
            ? gem.certificateDetails.certifyingBody
            : "No Certificate",
          location: gem.location || "Unknown",
          views: gem.views || 0,
          features: gem.tags || [],
          seller: gem.sellerInfo.name,
          sellerRating: gem.sellerInfo.rating || 0,
          image:
            "http://localhost:5001/" + gem.primaryImage.replace(/\\/g, "/"),
          status: "active",
          isAuctioned: gem.isAuctioned,
          bidCount: gem.bidCount || 0,
          timeLeft: gem.timeLeft || Math.floor(Math.random() * 48) + 1,
        }));

        setAuctions(mappedAuctions);
      } catch (error) {
        console.error("Failed to fetch gemstones:", error);
      }
    }

    fetchGems();
  }, []);

  // Toggle filter sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter and sort auctions
  const filteredAuctions = useMemo(() => {
    // Defensive check: if auctions is not an array, return empty array to avoid errors
    if (!Array.isArray(auctions)) return [];

    // Filter auctions based on various criteria
    let filtered = auctions.filter((auction) => {
      // Search filter: match title or seller with search query (case insensitive)
      const matchesSearch =
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.seller.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter: if no categories selected, include all; otherwise match selected categories
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(auction.category);

      // Price filter: currentBid must be within selected price range
      const matchesPrice =
        auction.currentBid >= priceRange[0] &&
        auction.currentBid <= priceRange[1];

      // Certification filter: if none selected, include all; otherwise match selected certifications
      const matchesCertification =
        selectedCertifications.length === 0 ||
        selectedCertifications.includes(auction.certification);

      // Location filter: if none selected, include all; otherwise match selected locations
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(auction.location);

      // Return true only if all filters pass
      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesCertification &&
        matchesLocation
      );
    });

    // Sort filtered auctions according to selected sort criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "ending_soon":
          return new Date(a.endTime) - new Date(b.endTime);
        case "price_low":
          return a.currentBid - b.currentBid;
        case "price_high":
          return b.currentBid - a.currentBid;
        case "most_bids":
          return b.bidCount - a.bidCount;
        case "most_viewed":
          return b.views - a.views;
        default:
          return 0; // No sorting or unrecognized sort option
      }
    });

    return filtered;
  }, [
    auctions,
    searchQuery,
    selectedCategories,
    priceRange,
    selectedCertifications,
    selectedLocations,
    sortBy,
  ]);

  // Get status badge color
  const getStatusBadge = (status) => {
    const badges = {
      hot: "bg-red-500 text-white",
      ending_soon: "bg-orange-500 text-white",
      active: "bg-green-500 text-white",
    };
    return badges[status] || badges.active;
  };

  // Format time left
  const formatTimeLeft = (timeLeft) => {
    return timeLeft;
  };

  const handlePlaceBid = (gemId) => {
    navigate(`/auction-details/${gemId}`);
  };

  // Filters Component
  const FiltersPanel = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? "fixed inset-0 z-50 bg-white" : ""
      } p-4 space-y-6`}
    >
      {isMobile && (
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={() => setShowMobileFilters(false)}>
            <X size={24} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search auctions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          <span>Gem Category</span>
          {expandedSections.category ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
        {expandedSections.category && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category)
                      );
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      {/* <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          <span>Price Range</span>
          {expandedSections.price ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              {[5000, 10000, 25000, 50000].map((price) => (
                <button
                  key={price}
                  onClick={() => setPriceRange([0, price])}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  &lt;${price.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div> */}

      {/* Certification */}
      <div>
        <button
          onClick={() => toggleSection("certification")}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          <span>Certification</span>
          {expandedSections.certification ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
        {expandedSections.certification && (
          <div className="space-y-2">
            {certifications.map((cert) => (
              <label key={cert} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCertifications.includes(cert)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCertifications([
                        ...selectedCertifications,
                        cert,
                      ]);
                    } else {
                      setSelectedCertifications(
                        selectedCertifications.filter((c) => c !== cert)
                      );
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cert}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          <span>Location</span>
          {expandedSections.location ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
        {expandedSections.location && (
          <div className="space-y-2">
            {locations.map((location) => (
              <label key={location} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations([...selectedLocations, location]);
                    } else {
                      setSelectedLocations(
                        selectedLocations.filter((l) => l !== location)
                      );
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          setSearchQuery("");
          setSelectedCategories([]);
          setPriceRange([0, 100000]);
          setSelectedCertifications([]);
          setSelectedLocations([]);
        }}
        className="w-full py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  // Auction Card Component
  const AuctionCard = ({ auction, isListView = false, onPlaceBid }) => (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        isListView ? "flex" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative ${
          isListView ? "w-64 flex-shrink-0" : "aspect-w-4 aspect-h-3"
        }`}
      >
        <img
          src={auction.image}
          alt={auction.title}
          className={`w-full object-cover ${isListView ? "h-48" : "h-48"}`}
        />

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
            auction.status
          )}`}
        >
          {auction.status === "hot" && (
            <Zap size={12} className="inline mr-1" />
          )}
          {auction.status === "ending_soon" && (
            <Clock size={12} className="inline mr-1" />
          )}
          {auction.status === "active" && (
            <TrendingUp size={12} className="inline mr-1" />
          )}
          {auction.status.replace("_", " ").toUpperCase()}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
          <Heart size={16} className="text-gray-600 hover:text-red-500" />
        </button>

        {/* View Count */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center">
          <Eye size={12} className="mr-1" />
          {auction.views}
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isListView ? "flex-1" : ""}`}>
        <div
          className={`${isListView ? "flex justify-between items-start" : ""}`}
        >
          <div className={`${isListView ? "flex-1 pr-4" : ""}`}>
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {auction.title}
            </h3>

            {/* Gem Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Gem size={14} className="mr-1" />
                {auction.weight}
              </div>
              <div className="flex items-center">
                <Award size={14} className="mr-1" />
                {auction.certification}
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {auction.location}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-3">
              {auction.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {auction.features.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{auction.features.length - 3} more
                </span>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Shield size={14} className="text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {auction.seller}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Star size={12} className="text-yellow-400 mr-1" />
                  {auction.sellerRating}
                </div>
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className={`${isListView ? "text-right" : ""}`}>
            {/* Current Bid */}
            <div className="mb-2">
              <div className="text-sm text-gray-600">Current Bid</div>
              <div className="text-2xl font-bold text-green-600">
                LKR {auction.currentBid.toLocaleString()}
              </div>
            </div>

            {/* Bid Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  Starting: LKR {auction.startingBid.toLocaleString()}
                </span>
                <span>{auction.bidCount} bids</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (auction.currentBid / (auction.startingBid * 2)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Time Left */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-orange-600 mb-1">
                <Clock size={14} className="mr-1" />
                <span className="font-medium">
                  Ends in {formatTimeLeft(auction.timeLeft)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-2 ${
                isListView ? "flex space-y-0 space-x-2" : ""
              }`}
            >
              <button
                onClick={onPlaceBid}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Place Bid
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Watch Auction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title and Count */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Gem Auctions</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredAuctions.length} items
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ending_soon">Ending Soon</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="most_bids">Most Bids</option>
                <option value="most_viewed">Most Viewed</option>
              </select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h2>
                </div>
              </div>
              <FiltersPanel />
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="lg:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowMobileFilters(false)}
              ></div>
              <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto">
                <FiltersPanel isMobile={true} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters Display */}
            {(selectedCategories.length > 0 ||
              selectedCertifications.length > 0 ||
              selectedLocations.length > 0) && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active Filters:
                  </span>
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                      <button
                        onClick={() =>
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== category)
                          )
                        }
                        className="ml-2 hover:text-blue-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {selectedCertifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {cert}
                      <button
                        onClick={() =>
                          setSelectedCertifications(
                            selectedCertifications.filter((c) => c !== cert)
                          )
                        }
                        className="ml-2 hover:text-green-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {selectedLocations.map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {location}
                      <button
                        onClick={() =>
                          setSelectedLocations(
                            selectedLocations.filter((l) => l !== location)
                          )
                        }
                        className="ml-2 hover:text-purple-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No auctions found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                    setSelectedCertifications([]);
                    setSelectedLocations([]);
                    setPriceRange([0, 100000]);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    isListView={viewMode === "list"}
                    onPlaceBid={() => handlePlaceBid(auction.id)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredAuctions.length > 0 && (
              <div className="text-center mt-8">
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Load More Auctions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemsAuctionPage;
