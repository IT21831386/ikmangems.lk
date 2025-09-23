import React, { useState } from "react";
import { User, Menu } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">ikmangems.lk</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {["Home", "Bids", "Auctions", "Contact us", "Notifications"].map(
                (item, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`px-3 py-2 text-sm font-medium ${
                      index === 0
                        ? "text-gray-900 hover:text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">User</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {["Home", "Bids", "Auctions", "Contact us", "Notifications"].map(
              (item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
