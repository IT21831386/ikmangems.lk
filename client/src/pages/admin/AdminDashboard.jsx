import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, UserCog, Users, CreditCard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UsersList from "./admin-um/DisplayUsers";
import PaymentHistory from "./payments/paymentHistory";
import AccountSettings from "../user/AccountSettings";
import ListingApprovals from "./listing/listing-approval";
import Ticket from "../help-center/SupportDashboard";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Admin Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Approvals
                </h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">23</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Verified Listings
                </h3>
                <p className="text-3xl font-bold text-green-600 mt-2">456</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Revenue
                </h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  $12,345
                </p>
              </div>
            </div>
          </div>
        );

      case "listingapprovals":
        return <ListingApprovals />;

      case "manageusers":
        return <UsersList />;

      case "transactions":
        return <PaymentHistory />;

      case "ticket":
        return <Ticket />;

      case "profile":
        return <AccountSettings />;

      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Admin Dashboard
            </h1>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      {/* MAIN CHANGE: Fixed container structure */}
      <div className="w-full h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("dashboard")}
                  className={
                    activeSection === "dashboard" ? "w-full bg-gray-200 " : ""
                  }
                >
                  <Home className="mr-2" /> Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("listingapprovals")}
                  className={
                    activeSection === "listingapprovals"
                      ? "bg-gray-200 w-full"
                      : ""
                  }
                >
                  <Users className="mr-2" /> Listing Approvals
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("manageusers")}
                  className={
                    activeSection === "manageusers" ? "bg-gray-200" : ""
                  }
                >
                  <Users className="mr-2" /> Manage Users
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("transactions")}
                  className={
                    activeSection === "transactions" ? "bg-gray-200" : ""
                  }
                >
                  <CreditCard className="mr-2" /> Transactions
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("ticket")}
                  className={activeSection === "ticket" ? "bg-gray-200" : ""}
                >
                  <CreditCard className="mr-2" /> Ticket Management
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("profile")}
                  className={activeSection === "profile" ? "bg-gray-200" : ""}
                >
                  <UserCog className="mr-2" /> Profile
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <Button
              variant="outline"
              className="w-full bg-red-800 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" /> Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN CHANGE: New content area structure */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile sidebar trigger - only show on mobile */}
          <div className="md:hidden p-4">
            <SidebarTrigger />
          </div>

          {/* Main content area - More explicit width control */}
          <main className="flex-1 min-w-0 overflow-auto">
            <div className="w-full h-full">{renderContent()}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
