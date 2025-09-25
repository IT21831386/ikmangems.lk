import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  User2,
  ChevronUp,
  LogOut,
  UserCog,
  Users,
  CreditCard,
} from "lucide-react";
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
        return <div>Welcome to Admin Dashboard</div>;
      case "manageusers":
        return <div>Manage users and roles</div>;
      case "transactions":
        return <div>View all transactions</div>;
      case "profile":
        return <div>Edit your profile</div>;
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("dashboard")}
                >
                  <Home className="mr-2" /> Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("manageusers")}
                >
                  <Users className="mr-2" /> Manage Users
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("transactions")}
                >
                  <CreditCard className="mr-2" /> Transactions
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveSection("profile")}>
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

        <div className="flex-1 p-6 overflow-auto">
          <SidebarTrigger className="mb-4 w-full" />
          {renderContent()}
        </div>
      </div>
    </SidebarProvider>
  );
}
