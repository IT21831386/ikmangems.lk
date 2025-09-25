import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  Heart,
  Hammer,
  RefreshCw,
  MessageSquare,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('paid');
  const [sortBy, setSortBy] = useState('most_recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [usernameSearch, setUsernameSearch] = useState('');

  // Sample order data - replace with actual data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-09-20',
      status: 'paid',
      total: '$125.50',
      items: 3,
      username: 'user123',
    },
    {
      id: 'ORD-2024-002',
      date: '2024-09-18',
      status: 'shipped',
      total: '$89.99',
      items: 1,
      username: 'gemcollector',
    },
    {
      id: 'ORD-2024-003',
      date: '2024-09-15',
      status: 'awaiting_payment',
      total: '$234.75',
      items: 5,
      username: 'jewelryfan',
    },
  ];

  const tabs = [
    { key: 'all', label: 'All', count: orders.length, icon: Calendar },
    { key: 'awaiting_payment', label: 'Awaiting payment', count: 1, icon: Clock },
    { key: 'awaiting_shipment', label: 'Awaiting Shipment', count: 0, icon: Package },
    { key: 'paid', label: 'Paid & Shipped', count: 2, icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', count: 0, icon: XCircle },
  ];

  const sidebarItems = [
    { icon: Calendar, label: 'Account Dashboard', active: false },
    { icon: MessageSquare, label: 'Messages', active: false },
    { icon: Heart, label: 'Item Watch', active: false },
    { icon: Hammer, label: 'Current Bids', active: false },
    { icon: RefreshCw, label: 'Offers', active: false },
    { icon: MessageCircle, label: 'Feedback', active: false },
    { icon: Package, label: 'Order History', active: true },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (usernameSearch && !order.username.toLowerCase().includes(usernameSearch.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Received status</span>
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                <option>All</option>
                <option>Received</option>
                <option>Not Received</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="most_recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="price_high">Price High to Low</option>
                <option value="price_low">Price Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b -mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 border-b">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search username..."
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by invoice number, product sku, or product id"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No orders found</div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search criteria or filters
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'awaiting_payment'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Date: {order.date}</span>
                      <span className="mx-2">•</span>
                      <span>Items: {order.items}</span>
                      <span className="mx-2">•</span>
                      <span>User: {order.username}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-gray-900">{order.total}</div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
