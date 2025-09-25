//should be removed
//Added by dana


/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, FileText } from "lucide-react";
import jsPDF from "jspdf";

export default function UpdateUser({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "User",
    status: "Active",
    password: "",
    confirmPassword: ""
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/user/${userId}`, { withCredentials: true });
        setUser(response.data);
        setForm({
          name: response.data.name || "",
          email: response.data.email || "",
          role: response.data.role || "User",
          status: response.data.status || "Active",
          password: "",
          confirmPassword: ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await axios.put(`http://localhost:5001/api/user/${userId}`, form, { withCredentials: true });
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5001/api/user/${userId}`, { withCredentials: true });
      alert("User deleted successfully.");
      // optionally redirect to users list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("User Details", 20, 20);
    doc.text(`Name: ${form.name}`, 20, 30);
    doc.text(`Email: ${form.email}`, 20, 40);
    doc.text(`Role: ${form.role}`, 20, 50);
    doc.text(`Status: ${form.status}`, 20, 60);
    doc.save(`${form.name}_details.pdf`);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold">Update User Details</h1>

   
      <section className="space-y-4 border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold">Personal Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
        </div>
      </section>

 
      <section className="space-y-4 border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold">Account Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

   
      <section className="space-y-4 border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold">Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>


      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 pt-4">
        <div className="flex gap-4">
          <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
            Save Changes
          </Button>
          <Button
            onClick={exportPDF}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export as PDF
          </Button>
        </div>
        <Button
          onClick={handleDelete}
          className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 mt-2 md:mt-0"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </Button>
      </div>
    </div>
  );
}

*/