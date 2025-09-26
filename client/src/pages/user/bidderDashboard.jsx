//Dana
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentHistory from "../paymentHistory";
import AccountSettings from "./AccountSettings"; 

import {
  Inbox,
  User2,
  ChevronUp,
  LogOut,
  Home,
  Wallet,
  UserCog,
  Gavel,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    { title: "Users", key: "users", icon: Inbox },
    { title: "Transactions", key: "transactions", icon: Wallet },
    { title: "My Bids", key: "mybids", icon: Gavel },
    { title: "Profile", key: "profile", icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <div>Welcome to the dashboard</div>;

      case "users":
        return <UsersList />;

      case "transactions":
        return <PaymentHistory />;

      case "mybids":
        return <div>Ongoing auctions you placed bids on</div>;

      case "profile":
        return <AccountSettings />;

      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.key)}
                      className={
                        activeSection === item.key ? "bg-gray-200" : ""
                      }
                    >
                      {/* Colored icon based on active state */}
                      <item.icon
                        className={`mr-2 ${
                          activeSection === item.key
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

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
                  <DropdownMenuItem onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 p-6">
        <SidebarTrigger />
        {renderContent()}
      </main>
    </SidebarProvider>
  );
}
