import React from "react";
import { Search, User, Menu, Star, Shield, Award } from "lucide-react";
import ChatBot from "../components/ChatBot";

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-96">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Your Gateway To Exclusive Gem Auctions
          </h1>
          <p className="text-xl text-white mb-8">
            Sri Lanka's Premier Gem Auction Platform
          </p>
          <p className="text-lg text-white mb-12">
            Connect with authenticated gem dealers and secure your precious
            stones through our trusted auction system
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gem Name
                </label>
                <input
                  type="text"
                  placeholder="Search gems..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Any Price</option>
                  <option>Under $1,000</option>
                  <option>$1,000 - $5,000</option>
                  <option>$5,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Search size={20} className="mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome Section Component
const WelcomeSection = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ayubowan!</h2>
            <h3 className="text-3xl font-bold text-gray-900">
              Explore Sri Lankan Authentic Gems
            </h3>
            <p className="text-gray-600 mt-2">
              Discover authentic certified gemstones of different gems and
              gemstones through our verified dealers and secure auction platform
              with complete transparency and authenticity guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Popular Gems Component
const PopularGems = () => {
  const gems = [
    { name: "Ceylon Blue Sapphire", color: "bg-blue-600", image: "💎" },
    { name: "Padparadscha Sapphires", color: "bg-orange-400", image: "💎" },
    { name: "Rubies", color: "bg-red-600", image: "💎" },
    { name: "Spinel", color: "bg-red-800", image: "💎" },
    { name: "Alexandrite", color: "bg-green-800", image: "💎" },
    { name: "Cat's Eye (Chrysoberyl)", color: "bg-yellow-600", image: "💎" },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">MOST POPULAR</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gems.map((gem, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-16 h-16 ${gem.color} rounded-lg mx-auto mb-4 flex items-center justify-center text-white text-2xl`}
              >
                {gem.image}
              </div>
              <h3 className="text-sm font-medium text-gray-900">{gem.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Verified Sellers Component
const VerifiedSellers = () => {
  const sellers = [
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.8,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.9,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.8,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.7,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.9,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
    {
      name: "Merit Lanka",
      verified: "NGJA",
      rating: 4.8,
      sales: "1.5M",
      items: "Most prestigious gems",
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">
          VERIFIED SELLERS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                  <Shield className="text-gray-900" size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{seller.name}</h3>
                  <div className="flex items-center">
                    <span className="text-green-400 text-sm font-medium">
                      Verified
                    </span>
                    <span className="ml-2 text-blue-400 text-sm">
                      {seller.verified}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Star className="text-yellow-400 mr-1" size={16} />
                  <span>{seller.rating}</span>
                </div>
                <div>
                  <span className="text-gray-300">
                    {seller.sales} • {seller.items}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <WelcomeSection />
      <PopularGems />
      <VerifiedSellers />
      <ChatBot />
    </div>
  );
};

export default App;
