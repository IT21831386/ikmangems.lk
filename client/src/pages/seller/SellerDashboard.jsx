import React, { useState } from "react";
import OrderHistoryPage from "../user/OrderHistoryPage";
import AccountSettings from "../user/AccountSettings";
import Gems from "../gem-listing/GemDisplay";
import GemCreate from "../gem-listing/Gemstone";
import GemAnalytics from "./GemAnalytics";

// Mock data for demonstration
const mockGems = [
  {
    id: 1,
    name: "Blue Sapphire",
    type: "Sapphire",
    weight: 2.5,
    color: "Deep Blue",
    clarity: "VS1",
    status: "active",
    startingPrice: 1500,
    currentBid: 2300,
    bidsCount: 12,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    image: "https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Sapphire",
  },
  {
    id: 2,
    name: "Ruby Heart",
    type: "Ruby",
    weight: 1.8,
    color: "Pigeon Blood Red",
    clarity: "VVS2",
    status: "sold",
    startingPrice: 2000,
    finalPrice: 3500,
    bidsCount: 18,
    soldDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    image: "https://via.placeholder.com/200x200/EF4444/FFFFFF?text=Ruby",
  },
  {
    id: 3,
    name: "Emerald Cut Emerald",
    type: "Emerald",
    weight: 3.2,
    color: "Vivid Green",
    clarity: "VS2",
    status: "pending",
    startingPrice: 2800,
    image: "https://via.placeholder.com/200x200/10B981/FFFFFF?text=Emerald",
  },
  {
    id: 4,
    name: "Yellow Diamond",
    type: "Diamond",
    weight: 1.2,
    color: "Fancy Yellow",
    clarity: "IF",
    status: "expired",
    startingPrice: 5000,
    highestBid: 4200,
    bidsCount: 8,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    image: "https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=Diamond",
  },
];

const mockRevenue = {
  totalRevenue: 15750,
  monthlyRevenue: 3500,
  activeAuctions: 1,
  soldGems: 3,
  averagePrice: 5250,
  topBid: 3500,
};

// Custom Sidebar Components
function Sidebar({ children, isCollapsed, onToggle }) {
  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-200"
      >
        {isCollapsed ? "" : "Seller Dashboard"}
      </button>
      {children}
    </div>
  );
}

function SidebarItem({ icon, title, isActive, onClick, isCollapsed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-gray-50 flex items-center ${
        isActive
          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
          : "text-gray-700"
      }`}
    >
      <span className="text-xl mr-3">{icon}</span>
      {!isCollapsed && <span>{title}</span>}
    </button>
  );
}

// Add Gem Component
function AddGem({ onAdd, onCancel }) {
  const [gemData, setGemData] = useState({
    name: "",
    type: "",
    weight: "",
    color: "",
    clarity: "",
    startingPrice: "",
    description: "",
    auctionDuration: "7",
  });

  const handleSubmit = () => {
    if (
      !gemData.name ||
      !gemData.type ||
      !gemData.weight ||
      !gemData.startingPrice
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newGem = {
      ...gemData,
      id: Date.now(),
      status: "pending",
      weight: parseFloat(gemData.weight),
      startingPrice: parseFloat(gemData.startingPrice),
      image: `https://via.placeholder.com/200x200/6366F1/FFFFFF?text=${encodeURIComponent(
        gemData.type
      )}`,
    };
    onAdd(newGem);
    setGemData({
      name: "",
      type: "",
      weight: "",
      color: "",
      clarity: "",
      startingPrice: "",
      description: "",
      auctionDuration: "7",
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">List New Gem</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gem Name *</label>
            <input
              type="text"
              value={gemData.name}
              onChange={(e) => setGemData({ ...gemData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter gem name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              value={gemData.type}
              onChange={(e) => setGemData({ ...gemData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="Diamond">Diamond</option>
              <option value="Ruby">Ruby</option>
              <option value="Sapphire">Sapphire</option>
              <option value="Emerald">Emerald</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Weight (carats) *
            </label>
            <input
              type="number"
              step="0.1"
              value={gemData.weight}
              onChange={(e) =>
                setGemData({ ...gemData, weight: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Color *</label>
            <input
              type="text"
              value={gemData.color}
              onChange={(e) =>
                setGemData({ ...gemData, color: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter color"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Clarity</label>
            <select
              value={gemData.clarity}
              onChange={(e) =>
                setGemData({ ...gemData, clarity: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Clarity</option>
              <option value="FL">FL - Flawless</option>
              <option value="IF">IF - Internally Flawless</option>
              <option value="VVS1">VVS1 - Very Very Slightly Included</option>
              <option value="VVS2">VVS2 - Very Very Slightly Included</option>
              <option value="VS1">VS1 - Very Slightly Included</option>
              <option value="VS2">VS2 - Very Slightly Included</option>
              <option value="SI1">SI1 - Slightly Included</option>
              <option value="SI2">SI2 - Slightly Included</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Starting Price ($) *
            </label>
            <input
              type="number"
              value={gemData.startingPrice}
              onChange={(e) =>
                setGemData({ ...gemData, startingPrice: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Auction Duration (days)
          </label>
          <select
            value={gemData.auctionDuration}
            onChange={(e) =>
              setGemData({ ...gemData, auctionDuration: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={gemData.description}
            onChange={(e) =>
              setGemData({ ...gemData, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Detailed description of the gem..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            List Gem
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Gem Listings Component
function GemListings({ gems, onEdit, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-800", symbol: "" },
      sold: { bg: "bg-blue-100", text: "text-blue-800", symbol: "" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", symbol: "" },
      expired: { bg: "bg-red-100", text: "text-red-800", symbol: "" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className="mr-1">{config.symbol}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatTimeLeft = (endTime) => {
    if (!endTime) return "N/A";
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Gem Listings</h2>

      <div className="grid gap-4">
        {gems.map((gem) => (
          <div
            key={gem.id}
            className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <img
                src={gem.image}
                alt={gem.name}
                className="w-20 h-20 object-cover rounded-md"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold">{gem.name}</h3>
                    <p className="text-gray-600">
                      {gem.type} • {gem.weight}ct • {gem.color} • {gem.clarity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(gem.status)}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDropdown(
                            showDropdown === gem.id ? null : gem.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        ⋮
                      </button>
                      {showDropdown === gem.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <button
                            onClick={() => {
                              onEdit(gem.id);
                              setShowDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              onDelete(gem.id);
                              setShowDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-red-600"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Starting Price</p>
                    <p className="font-semibold">
                      ${gem.startingPrice?.toLocaleString()}
                    </p>
                  </div>

                  {gem.status === "active" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Current Bid</p>
                        <p className="font-semibold text-green-600">
                          ${gem.currentBid?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bids</p>
                        <p className="font-semibold">{gem.bidsCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Left</p>
                        <p className="font-semibold">
                          {formatTimeLeft(gem.endTime)}
                        </p>
                      </div>
                    </>
                  )}

                  {gem.status === "sold" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Final Price</p>
                        <p className="font-semibold text-green-600">
                          ${gem.finalPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Bids</p>
                        <p className="font-semibold">{gem.bidsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sold Date</p>
                        <p className="font-semibold">
                          {gem.soldDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}

                  {gem.status === "expired" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Highest Bid</p>
                        <p className="font-semibold">
                          ${gem.highestBid?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Bids</p>
                        <p className="font-semibold">{gem.bidsCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ended</p>
                        <p className="font-semibold">
                          {gem.endTime?.toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ revenue, gems }) {
  const activeAuctions = gems.filter((gem) => gem.status === "active");
  const soldGems = gems.filter((gem) => gem.status === "sold");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Seller Dashboard</h2>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${revenue.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-3xl font-bold text-blue-600">
                ${revenue.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Sale</p>
              <p className="text-3xl font-bold text-purple-600">
                ${revenue.averagePrice.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl"></div>
          </div>
        </div>
      </div>

      {/* Active Auctions */}
      <div className="bg-white rounded-lg shadow p-6 border">
        <h3 className="text-xl font-bold mb-4">Active Auctions</h3>
        {activeAuctions.length > 0 ? (
          <div className="space-y-4">
            {activeAuctions.map((gem) => (
              <div
                key={gem.id}
                className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={gem.image}
                    alt={gem.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{gem.name}</h4>
                    <p className="text-sm text-gray-600">
                      {gem.type} • {gem.weight}ct
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${gem.currentBid?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{gem.bidsCount} bids</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active auctions</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center border">
          <p className="text-2xl font-bold">{gems.length}</p>
          <p className="text-sm text-gray-500">Total Listings</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center border">
          <p className="text-2xl font-bold">{activeAuctions.length}</p>
          <p className="text-sm text-gray-500">Active Auctions</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center border">
          <p className="text-2xl font-bold">{soldGems.length}</p>
          <p className="text-sm text-gray-500">Sold Gems</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center border">
          <p className="text-2xl font-bold">
            ${revenue.topBid.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Highest Sale</p>
        </div>
      </div>
    </div>
  );
}

// Main Seller Dashboard Component
export default function SellerDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [gems, setGems] = useState(mockGems);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    alert("Logging out...");
    // Simulate logout
  };

  const handleAddGem = (newGem) => {
    setGems([...gems, newGem]);
    setActiveSection("listings");
    alert("Gem listed successfully!");
  };

  const handleEditGem = (gemId) => {
    alert(`Edit gem: ${gemId}`);
    // Implement edit functionality
  };

  const handleDeleteGem = (gemId) => {
    if (window.confirm("Are you sure you want to delete this gem listing?")) {
      setGems(gems.filter((gem) => gem.id !== gemId));
      alert("Gem listing deleted successfully!");
    }
  };

  const sidebarItems = [
    { title: "Dashboard", key: "dashboard", icon: "" },
    { title: "My Listings", key: "listings", icon: "" },
    { title: "Add New Gem", key: "add-gem", icon: "" },
    { title: "Analytics", key: "analytics", icon: "" },
    { title: "Revenue", key: "revenue", icon: "" },
    { title: "Profile", key: "profile", icon: "" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview revenue={mockRevenue} gems={gems} />;
      case "listings":
        return <Gems />;
      case "add-gem":
        return <GemCreate />;
      case "revenue":
        return <OrderHistoryPage />;
      case "analytics":
        return <GemAnalytics />;

      case "profile":
        return <AccountSettings />;
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <div className="py-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              title={item.title}
              isActive={activeSection === item.key}
              onClick={() => setActiveSection(item.key)}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* User Menu */}
        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full p-4 text-left hover:bg-gray-50 flex items-center"
            >
              <span className="text-xl mr-3">👤</span>
              {!sidebarCollapsed && <span>Seller</span>}
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-t-md shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-red-600"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </Sidebar>

      <main className="flex-1 p-6 overflow-auto">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mb-4 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50"
        >
          ☰
        </button>
        {renderContent()}
      </main>
    </div>
  );
}