import React from "react";
import { useNavigate } from "react-router-dom";

import { Search, User, Menu, Star, Shield, Award } from "lucide-react";
import ChatBot from "../components/ChatBot";
import { motion, AnimatePresence } from "framer-motion";

// Hero Section Component
const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 min-h-[600px] flex items-center"
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <video
        autoPlay
        loop
        muted
        playsInline // Improves mobile performance
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/videos/gem-hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
        >
          Discover Exquisite Ceylon Gems
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
        >
          Sri Lanka's Premier Platform for Authentic Gem Auctions
        </motion.p>
      </div>
    </motion.div>
  );
};

// Welcome Section Component
const WelcomeSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center"
        >
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mr-6">
            <img
              src="\images\home\welcome.png"
              alt="Lotus Icon"
              className="w-16 h-16"
            />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900">
              Ayubowan!
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">
              Authentic Sri Lankan Gems
            </h3>
            <p className="text-gray-600 mt-4 max-w-xl">
              Explore a curated selection of certified gemstones from trusted
              dealers. Bid with confidence on our secure, transparent auction
              platform.
            </p>
            <button
              onClick={() => navigate("/auction")}
              className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Auctions
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Popular Gems Component
const PopularGems = () => {
  const gems = [
    {
      name: "Ceylon Blue Sapphire",
      color: "bg-indigo-600",
      image: "/gems/sapphire.jpg",
    },
    {
      name: "Padparadscha Sapphire",
      color: "bg-orange-500",
      image: "/gems/padparadscha.jpg",
    },
    { name: "Ruby", color: "bg-red-700", image: "/gems/ruby.jpg" },
    { name: "Spinel", color: "bg-red-900", image: "/gems/spinel.jpg" },
    {
      name: "Alexandrite",
      color: "bg-green-800",
      image: "/gems/alexandrite.jpg",
    },
    { name: "Cat's Eye", color: "bg-yellow-600", image: "/gems/cats-eye.jpg" },
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-indigo-600 mb-10">
          Most Popular Gems
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {gems.map((gem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <div className="relative w-full h-32">
                <img
                  src={gem.image}
                  alt={gem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-0 transition-all" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-gray-900">
                  {gem.name}
                </h3>
              </div>
            </motion.div>
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
      name: "Merit Lanka Gems",
      verified: "NGJA",
      rating: 4.8,
      sales: "1.5K",
      items: "Premium Sapphires",
      avatar: "/sellers/merit-lanka.jpg",
    },
    // Add more unique sellers as needed
  ];

  return (
    <div className="bg-gray-900 py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-amber-400 mb-10">
          Verified Sellers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-800 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center mb-4">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">{seller.name}</h3>
                  <div className="flex items-center">
                    <span className="text-green-400 text-sm font-medium">
                      Verified
                    </span>
                    <span className="ml-2 text-amber-400 text-sm">
                      {seller.verified}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Star className="text-amber-400 mr-1" size={16} />
                  <span>{seller.rating}</span>
                </div>
                <div>
                  <span className="text-gray-300">
                    {seller.sales} Sales • {seller.items}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeroSection />
      <WelcomeSection />
      <PopularGems />
      <VerifiedSellers />
      <ChatBot />
    </div>
  );
};

export default App;
