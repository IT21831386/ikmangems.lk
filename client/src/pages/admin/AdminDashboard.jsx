//Dana
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import PaymentHistory from "../paymentHistory";
import AccountSettings from "../user/AccountSettings"; 
import DisplayUsers from "./admin-um/DisplayUsers";
//import AddUser from '../admin-um/AddUser'

import {
  Inbox,
  User2,
  ChevronUp,
  LogOut,
  Home,
  Wallet,
  UserCog,
  Gavel,
  Users, 
  CreditCard,
} from "lucide-react";
import axios from "axios";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
//import UsersList from "./admin-um/DisplayUsers";
import PaymentHistory from "./payments/paymentHistory";
//import AccountSettings from "../user/AccountSettings";
//import UsersList from "./admin-um/DisplayUsers";
import AdminPaymentStatus from "./payments/adminPaymentStatus";
//import AccountSettings from "../user/AccountSettings";
import ListingApprovals from "./listing/listing-approval";
import Ticket from "../help-center/SupportDashboard";
import BidManagement from "./BidManagement";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUser from "./admin-um/AddUser";

export default function ManageUsers() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const sidebarItems = [
    { title: "Dashboard", key: "dashboard", icon: Home },
    { title: "Users", key: "users", icon: UserCog},
    { title: "Add User", key: "transactions", icon: UserCog},
    { title: "My Bids", key: "mybids", icon: Gavel },
    { title: "Profile", key: "profile", icon: UserCog },
  ];

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
        return <DisplayUsers />;

      case "transactions":
        return <AdminPaymentStatus />;

      case "bids":
        return <BidManagement />;

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
                  onClick={() => setActiveSection("bids")}
                  className={activeSection === "bids" ? "bg-gray-200" : ""}
                >
                  <CreditCard className="mr-2" /> Bid Management
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

         {/* <SidebarFooter>
            <Button
              variant="outline"
              className="w-full bg-red-800 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" /> Logout
            </Button>
          </SidebarFooter>*/}


                 <SidebarFooter>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton>
                              <User2 className="mr-2 text-gray-400" /> User
                              <ChevronUp className="ml-auto text-gray-400" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="top">
                            <DropdownMenuItem onClick={handleLogout} className=" text-red-600 hover:text-red-600">
                              Sign out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </SidebarMenu>
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
