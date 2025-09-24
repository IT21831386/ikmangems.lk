//Dana
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");

  const navigate = useNavigate()

    const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:5001/api/auth/logout",
      {},
      { withCredentials: true }
    );

    // remove any leftover client token (if you stored one)
    localStorage.removeItem("token");

    // redirect to login
    navigate("/login");
  } catch (err) {
    console.error("Logout error", err);
  }
};


  useEffect(() => {
    if (activeSection === "users") {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5001/api/user/all-users",
            { withCredentials: true }
          );
          setUsers(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [activeSection]);

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
        return <div>Welcome to the Admin Dashboard</div>;
      case "users":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id || user.id}>
                    <TableCell>{user._id || user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <button className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
                        Edit
                      </button>
                      <button className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        );
      case "transactions":
        return <div>All payment transactions go here</div>;
      case "mybids":
        return <div>Ongoing auctions you placed bids on</div>;
      case "profile":
        return <div>Edit your profile here</div>;
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
                      <item.icon className="mr-2" />
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
                    <User2 className="mr-2" /> User
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top">
                
                  <DropdownMenuItem onClick={handleLogout}> Sign out</DropdownMenuItem>

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



/*import React, { useState } from "react";
import { LogOut, Home, User, LayoutDashboard, Wallet, UserCog, Gavel } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, ClipboardListIcon, UserIcon, HomeIcon } from "lucide-react";

export default function BidderDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <div>Welcome to your Dashboard</div>;
      case "transactions":
        return <div>All Payment Transactions</div>;
      case "auctions":
        return <div>Ongoing Auctions you placed bids on</div>;
      case "profile":
        return <div>Edit your Profile here</div>;
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
       
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-lg font-bold">Bidder Dashboard</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("dashboard")}
                  isActive={activeSection === "dashboard"}
                  leftIcon={<HomeIcon />}

                ><LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("transactions")}
                  isActive={activeSection === "transactions"}
                  leftIcon={<CreditCardIcon />}

                ><Wallet className="h-4 w-4" />
                  Transactions
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("auctions")}
                  isActive={activeSection === "auctions"}
                  leftIcon={<ClipboardListIcon />}
                >
                  <Gavel className="h-4 w-4" />
                  My Bids
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("profile")}
                  isActive={activeSection === "profile"}
                  leftIcon={<UserIcon />}

                ><UserCog className="h-4 w-4" />
                  Profile
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" className="w-full bg-red-800 text-white hover:bg-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        
        <SidebarInset className="p-6 bg-gray-50 flex-1 overflow-auto">
          <SidebarTrigger className="mb-4 w-full" />
          {renderContent()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
*/


