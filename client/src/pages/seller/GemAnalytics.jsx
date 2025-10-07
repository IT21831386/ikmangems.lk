import React, { useMemo, useState } from "react";
import { gemstoneAPI } from "../../services/api";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  RefreshCw,
  Filter,
  Search
} from "lucide-react";
import jsPDF from "jspdf";

function formatCurrency(n) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat(undefined, { 
    style: 'currency', 
    currency: 'LKR',
    maximumFractionDigits: 0 
  }).format(n);
}

function formatNumber(n) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export default function GemAnalytics() {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("monthly");

  const daily = analytics?.data?.daily || [];
  const summary = analytics?.data?.summary || {};

  // Get additional metrics from backend
  const additionalMetrics = useMemo(() => {
    if (!analytics?.data?.summary) return {};
    
    return {
      totalRevenue: analytics.data.summary.totalRevenue || 0,
      highestBid: analytics.data.summary.highestBid || 0,
      lowestBid: analytics.data.summary.lowestBid || 0,
      avgBidsPerDay: analytics.data.summary.avgBidsPerDay || 0
    };
  }, [analytics]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return daily.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgPrice: Math.round(day.avgPrice || 0),
      bidCount: day.bidCount || 0
    }));
  }, [daily]);

  // Prepare pie chart data for gemstone distribution
  const pieData = useMemo(() => {
    if (!analytics?.data?.gemstoneDistribution) return [];
    
    return Object.entries(analytics.data.gemstoneDistribution).map(([name, value], index) => ({
      name,
      value,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    }));
  }, [analytics?.data?.gemstoneDistribution]);

  const onSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await gemstoneAPI.getGemstoneAnalytics({ name, start, end });
      setAnalytics(res);
    } catch (e) {
      setError(e?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!analytics) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Do you want to download the Gemstone Analytics Report as PDF?\n\n' +
      'This will generate a comprehensive report including:\n' +
      '• Summary metrics and insights\n' +
      '• Daily analytics data\n' +
      '• Gemstone distribution\n' +
      '• Performance analysis'
    );
    
    if (!confirmed) return;
    
    setExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add text with word wrap
      const addText = (text, x, y, options = {}) => {
        const { fontSize = 12, fontStyle = 'normal', color = '#000000' } = options;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color);
        pdf.text(text, x, y);
        return y + fontSize * 0.5;
      };
      
      // Helper function to add a line
      const addLine = (x1, y1, x2, y2) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(x1, y1, x2, y2);
      };
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Gemstone Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Filters used
      if (name || start || end) {
        addText('Filters Applied:', 20, yPosition, { fontSize: 14, fontStyle: 'bold' });
        yPosition += 10;
        
        if (name) {
          addText(`Gemstone Name: ${name}`, 20, yPosition);
          yPosition += 8;
        }
        if (start) {
          addText(`Start Date: ${new Date(start).toLocaleDateString()}`, 20, yPosition);
          yPosition += 8;
        }
        if (end) {
          addText(`End Date: ${new Date(end).toLocaleDateString()}`, 20, yPosition);
          yPosition += 8;
        }
        yPosition += 10;
      }
      
      // Summary Cards
      addText('Summary Metrics', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 15;
      
      const summaryData = [
        ['Total Bids', formatNumber(summary.totalBids)],
        ['Average Price', formatCurrency(summary.averagePrice)],
        ['Total Revenue', formatCurrency(additionalMetrics.totalRevenue)],
        ['Highest Bid', formatCurrency(additionalMetrics.highestBid)],
        ['Lowest Bid', formatCurrency(additionalMetrics.lowestBid)],
        ['Avg Bids/Day', additionalMetrics.avgBidsPerDay.toString()]
      ];
      
      summaryData.forEach(([label, value]) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        addText(`${label}:`, 20, yPosition);
        addText(value, 120, yPosition, { fontStyle: 'bold' });
        yPosition += 10;
      });
      
      yPosition += 10;
      
      // Peak Day and Recent Sale
      if (summary.peakDay) {
        addText(`Peak Bidding Day: ${summary.peakDay.bids} bids on ${new Date(summary.peakDay.date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (summary.mostRecentSale) {
        addText(`Most Recent Sale: ${formatCurrency(summary.mostRecentSale.price)} on ${new Date(summary.mostRecentSale.date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
      }
      
      yPosition += 15;
      
      // Daily Data Table
      if (daily.length > 0) {
        addText('Daily Analytics', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
        yPosition += 15;
        
        // Table headers
        addText('Date', 20, yPosition, { fontStyle: 'bold' });
        addText('Bids', 80, yPosition, { fontStyle: 'bold' });
        addText('Avg Price', 120, yPosition, { fontStyle: 'bold' });
        addText('Total', 180, yPosition, { fontStyle: 'bold' });
        yPosition += 10;
        
        addLine(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 5;
        
        // Table data
        daily.forEach(day => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          addText(new Date(day.date).toLocaleDateString(), 20, yPosition);
          addText(day.bidCount.toString(), 80, yPosition);
          addText(formatCurrency(day.avgPrice), 120, yPosition);
          addText(formatCurrency(day.total), 180, yPosition);
          yPosition += 8;
        });
      }
      
      // Gemstone Distribution
      if (pieData.length > 0) {
        yPosition += 15;
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
        
        addText('Gemstone Distribution', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
        yPosition += 15;
        
        pieData.forEach(gem => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          addText(`${gem.name}: ${gem.value} bids`, 20, yPosition);
          yPosition += 8;
        });
      }
      
      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`gemstone-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Show success message
      alert('✅ PDF Report generated successfully!\n\nThe report has been downloaded to your default download folder.');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error generating PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setName("");
    setStart("");
    setEnd("");
    setAnalytics(null);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gemstone Analytics</h1>
              <p className="text-gray-600">Data-driven insights for your gemstone listings</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!analytics || exporting}
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {exporting ? "Generating PDF..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gemstone Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sapphire, Ruby"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={onSearch}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center font-medium shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(summary.totalBids)}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-gray-500">All time</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.averagePrice)}</p>
                <div className="flex items-center mt-2">
                  <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-500">Per bid</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Day</p>
                <p className="text-xl font-bold text-gray-900">
                  {summary.peakDay ? `${summary.peakDay.bids} bids` : "-"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.peakDay ? new Date(summary.peakDay.date).toLocaleDateString() : "No data"}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Sale</p>
                <p className="text-xl font-bold text-gray-900">
                  {summary.mostRecentSale ? formatCurrency(summary.mostRecentSale.price) : "-"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.mostRecentSale ? new Date(summary.mostRecentSale.date).toLocaleDateString() : "No sales"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(additionalMetrics.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Bid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(additionalMetrics.highestBid)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lowest Bid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(additionalMetrics.lowestBid)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Bids/Day</p>
                  <p className="text-2xl font-bold text-gray-900">{additionalMetrics.avgBidsPerDay}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Data Insights */}
        {analytics && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Best Performance</p>
                    <p className="text-xs text-gray-600">
                      {summary.peakDay ? 
                        `${summary.peakDay.bids} bids on ${new Date(summary.peakDay.date).toLocaleDateString()}` : 
                        'No peak day data'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Price Range</p>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(additionalMetrics.lowestBid)} - {formatCurrency(additionalMetrics.highestBid)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Activity Level</p>
                    <p className="text-xs text-gray-600">
                      {additionalMetrics.avgBidsPerDay > 5 ? 'High' : 
                       additionalMetrics.avgBidsPerDay > 2 ? 'Medium' : 'Low'} activity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Price Analytics</h3>
                  <p className="text-sm text-gray-600">Average bid prices over time</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        `LKR ${value.toLocaleString()}`, 
                        name === 'avgPrice' ? 'Average Price' : 'Bid Count'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgPrice"
                      stroke="#3B82F6"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bids Distribution */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bid Distribution</h3>
                  <p className="text-sm text-gray-600">Daily bid counts</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="bidCount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Gemstone Distribution Pie Chart */}
        {analytics && pieData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gemstone Distribution</h3>
                <p className="text-sm text-gray-600">Bid distribution by gemstone type</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value} bids`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {analytics && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Revenue Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="font-medium">{formatCurrency(additionalMetrics.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average per Bid</span>
                    <span className="font-medium">{formatCurrency(summary.averagePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue per Day</span>
                    <span className="font-medium">
                      {formatCurrency(daily.length ? additionalMetrics.totalRevenue / daily.length : 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Bidding Activity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Bids</span>
                    <span className="font-medium">{formatNumber(summary.totalBids)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Average</span>
                    <span className="font-medium">{additionalMetrics.avgBidsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Peak Day</span>
                    <span className="font-medium">
                      {summary.peakDay ? `${summary.peakDay.bids} bids` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analytics && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-6">Select filters and click "Analyze" to view your gemstone analytics</p>
            <button
              onClick={onSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}