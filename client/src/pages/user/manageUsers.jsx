/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Eye, Edit, UserCog, Search } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredUserId, setHoveredUserId] = useState(null);

  // Fetch dynamic data from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/user/all-users", // Replace with your backend endpoint
          { withCredentials: true }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      await axios.delete(`http://localhost:5001/api/user/${user._id}`, { withCredentials: true });
      setUsers(users.filter((u) => u._id !== user._id));
      alert(`User ${user.name} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleUpdate = (user) => alert(`Update user ${user.name}`);
  const handleChangeRole = (user) => alert(`Change role for ${user.name}`);

  return (

    
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1>Added for Testing, will be replaces</h1>
     
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      
      <div className="rounded-lg bg-white shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <React.Fragment key={user._id || user.id}>
                
                <tr
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredUserId(user._id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                >
                  <td className="py-3 px-4 font-mono text-sm text-gray-600">{user._id.slice(-8)}...</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role || "User"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active" || !user.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>

                
                {hoveredUserId === user._id && (
                  <tr
                    className="bg-gray-50 border-t border-gray-100"
                    onMouseEnter={() => setHoveredUserId(user._id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                  >
                    <td colSpan={6} className="py-2 px-4">
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleUpdate(user)}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors text-sm"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleChangeRole(user)}
                          className="flex items-center gap-1 px-3 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors text-sm"
                          title="Change Role"
                        >
                          <UserCog className="w-4 h-4" />
                          Role
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors text-sm"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Role:</span>
                  <p className="text-gray-900">{selectedUser.role || "User"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <p className="text-gray-900">{selectedUser.status || "Active"}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Registered:</span>
                  <p className="text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">ID:</span>
                  <p className="text-gray-900 font-mono text-sm break-all">{selectedUser._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



/*import React, { useState, useEffect } from "react";
import { Trash2, Eye, Edit, UserCog, Search } from "lucide-react";

// Mock data for demonstration
const mockUsers = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
    createdAt: "2024-02-20T14:15:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    createdAt: "2024-03-10T09:45:00Z"
  }
];

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredUserId, setHoveredUserId] = useState(null);

  useEffect(() => {
    // Simulate API call
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (user) => {
    alert(`Delete user ${user.name}`);
  };
  const handleUpdate = (user) => alert(`Update user ${user.name}`);
  const handleChangeRole = (user) => alert(`Change role for ${user.name}`);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

    
      <div className="rounded-lg bg-white shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <React.Fragment key={user._id || user.id}>
             
                <tr 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredUserId(user._id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                >
                  <td className="py-3 px-4 font-mono text-sm text-gray-600">
                    {user._id.slice(-8)}...
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role || "User"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' || !user.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
                
              
                {hoveredUserId === user._id && (
                  <tr 
                    className="bg-gray-50 border-t border-gray-100"
                    onMouseEnter={() => setHoveredUserId(user._id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                  >
                    <td colSpan={6} className="py-2 px-4">
                      <div className="flex gap-4 items-center">
                        <span className="text-sm text-gray-600 font-medium">Actions:</span>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleUpdate(user)}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors text-sm"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleChangeRole(user)}
                          className="flex items-center gap-1 px-3 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors text-sm"
                          title="Change Role"
                        >
                          <UserCog className="w-4 h-4" />
                          Role
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors text-sm"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

     
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Role:</span>
                  <p className="text-gray-900">{selectedUser.role || "User"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <p className="text-gray-900">{selectedUser.status || "Active"}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Registered:</span>
                  <p className="text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">ID:</span>
                  <p className="text-gray-900 font-mono text-sm break-all">{selectedUser._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}*/