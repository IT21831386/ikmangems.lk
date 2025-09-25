import React, { useState } from "react";
import { User, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Auction", path: "/auction" },
    { name: "Contact us", path: "/contact" },
    { name: "Notifications", path: "/notifications" },
  ];

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "buyer":
        return "/bidder-dashboard";
      case "seller":
        return "/seller-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/"; // fallback
    }
  };

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
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium ${
                    index === 0
                      ? "text-gray-900 hover:text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {!user ? (
              <>
                <Link to="/login" className="text-sm text-gray-600">
                  Login
                </Link>
                <Link to="/signup" className="text-sm text-gray-600">
                  Signup
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600">{user.name}</span>
                <div
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={16} />
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-10 w-48 bg-white border rounded shadow-md z-50">
                    <Link
                      to={getDashboardPath()} // navigate based on role
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </>
            )}
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
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {!user ? (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-600">
                  Login
                </Link>
                <Link to="/signup" className="block px-3 py-2 text-gray-600">
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()} // mobile dashboard link
                  className="block px-3 py-2 text-gray-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-600"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
