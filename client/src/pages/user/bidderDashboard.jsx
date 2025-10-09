//Dana
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentHistory from "../admin/payments/paymentHistory";
import AccountSettings from "./AccountSettings"; 
import MyAuctions from "./MyAuctions"
import Navigation from "../../components/navigation";

import {
  User2,
  LogOut,
  Home,
  Wallet,
  UserCog,
  Gavel,
} from "lucide-react";
import axios from "axios";

export default function BidderDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const sidebarItems = [
    { key: "dashboard", title: "Dashboard", icon: Home },
    { key: "my-auctions", title: "My Auctions", icon: Gavel },
    { key: "account", title: "Account Settings", icon: UserCog },
    { key: "payments", title: "Payment History", icon: Wallet },
  ];

  // Custom Sidebar Component (similar to seller dashboard)
  const Sidebar = ({ children }) => {
    return (
      <div className="bg-white border-r border-gray-200 h-screen w-64">
        <div className="py-2">
          {children}
        </div>
      </div>
    );
  };

  // Sidebar Item Component
  const SidebarItem = ({ icon: Icon, title, isActive, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full p-4 text-left hover:bg-gray-50 flex items-center ${
          isActive
            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
            : "text-gray-700"
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span>{title}</span>
      </button>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bidder Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Active Bids</h3>
                <p className="text-3xl font-bold text-blue-600">5</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Won Auctions</h3>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
                <p className="text-3xl font-bold text-purple-600">$2,450</p>
              </div>
            </div>
          </div>
        );
      case "my-auctions":
        return <MyAuctions />;
      case "account":
        return <AccountSettings />;
      case "payments":
        return <PaymentHistory />;
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex h-screen bg-gray-50">
        <Sidebar>
          <div className="py-2">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                title={item.title}
                isActive={activeSection === item.key}
                onClick={() => setActiveSection(item.key)}
              />
            ))}
          </div>

          {/* User Menu */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Bidder</p>
                <p className="text-xs text-gray-500">Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}