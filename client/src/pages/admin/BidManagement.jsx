import axios from "axios";
import { useEffect, useState } from "react";
import { Search, Download, FileText } from "lucide-react";

function BidManagement() {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/bids/all");
        setBids(data.bids);
        setFilteredBids(data.bids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBids(bids);
    } else {
      const filtered = bids.filter(
        (bid) =>
          bid.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bid.gem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bid.amount.toString().includes(searchTerm)
      );
      setFilteredBids(filtered);
    }
  }, [searchTerm, bids]);

  // PDF Generation Function
  const generatePDF = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();
    const totalBids = filteredBids.length;
    const totalAmount = filteredBids.reduce((sum, bid) => sum + bid.amount, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bid Management Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #007bff;
            padding-bottom: 15px;
          }
          .header h1 { 
            color: #007bff; 
            margin: 0;
          }
          .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item h3 {
            margin: 0;
            color: #007bff;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #007bff; 
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .amount {
            text-align: right;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bid Management Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>${totalBids}</h3>
            <p>Total Bids</p>
          </div>
          <div class="summary-item">
            <h3>LKR ${totalAmount.toLocaleString()}</h3>
            <p>Total Amount</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Bid ID</th>
              <th>Buyer Name</th>
              <th>Gem Name</th>
              <th>Amount (LKR)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBids
              .map(
                (bid, index) => `
              <tr>
                <td>BID-${String(index + 1).padStart(3, "0")}</td>
                <td>${bid.buyer?.name || "N/A"}</td>
                <td>${bid.gem?.name || "N/A"}</td>
                <td class="amount">${bid.amount.toLocaleString()}</td>
                <td>${
                  bid.createdAt
                    ? new Date(bid.createdAt).toLocaleDateString()
                    : "N/A"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This report contains ${totalBids} bid(s) with a total value of LKR ${totalAmount.toLocaleString()}</p>
          <p>Report generated from Bid Management System</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bid Management
        </h1>
        <p className="text-gray-600">Manage and track all bidding activities</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by buyer, gem, or amount..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Bids</p>
              <p className="text-2xl font-bold text-blue-800">
                {filteredBids.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">LKR</span>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-800">
                {filteredBids
                  .reduce((sum, bid) => sum + bid.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">AVG</span>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Average Bid</p>
              <p className="text-2xl font-bold text-purple-800">
                {filteredBids.length > 0
                  ? Math.round(
                      filteredBids.reduce((sum, bid) => sum + bid.amount, 0) /
                        filteredBids.length
                    ).toLocaleString()
                  : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredBids.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bids found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "No bids have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (LKR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBids.map((bid, index) => (
                  <tr
                    key={bid._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      BID-{String(index + 1).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bid.buyer?.name || "N/A"}
                      </div>
                      {bid.buyer?.email && (
                        <div className="text-sm text-gray-500">
                          {bid.buyer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bid.gem?.name || "N/A"}
                      </div>
                      {bid.gem?.category && (
                        <div className="text-sm text-gray-500">
                          {bid.gem.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {bid.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bid.createdAt
                        ? new Date(bid.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BidManagement;
