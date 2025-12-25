import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Package, CreditCard, User, Mail, Phone } from 'lucide-react';

const MyAuctions = () => {
  const [activeTab, setActiveTab] = useState('won');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [wonAuctions, setWonAuctions] = useState([
    {
      id: 1,
      name: 'Blue Sapphire',
      image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&fit=crop',
      category: 'Sapphire',
      weight: '5.2 carats',
      finalBid: 15750,
      auctionEndDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      paymentDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
      status: 'pending',
      seller: 'GemHouse Co.'
    },
    {
      id: 2,
      name: 'Pink Diamond',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop',
      category: 'Diamond',
      weight: '2.8 carats',
      finalBid: 45200,
      auctionEndDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      paymentDeadline: new Date(Date.now() + 19 * 60 * 60 * 1000),
      status: 'pending',
      seller: 'Luxury Gems Ltd.'
    },
    {
      id: 3,
      name: 'Emerald Cut Ruby',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop',
      category: 'Ruby',
      weight: '3.5 carats',
      finalBid: 8900,
      auctionEndDate: new Date(Date.now() - 10 * 60 * 60 * 1000),
      paymentDeadline: new Date(Date.now() + 14 * 60 * 60 * 1000),
      status: 'pending',
      seller: 'Ruby Traders Inc.'
    }
  ]);

  const [myOrders] = useState([
    {
      id: 4,
      name: 'Yellow Citrine',
      image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=300&fit=crop',
      category: 'Citrine',
      weight: '4.1 carats',
      finalBid: 3200,
      paidDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'paid',
      trackingNumber: 'TRK123456789',
      seller: 'Crystal Palace'
    }
  ]);

  const calculateTimeRemaining = (deadline) => {
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const getStatusBadge = (status, deadline) => {
    const timeRemaining = calculateTimeRemaining(deadline);
    const isUrgent = deadline && (deadline - new Date()) < 6 * 60 * 60 * 1000;
    
    if (status === 'paid') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
        <CheckCircle className="w-4 h-4" /> Paid
      </span>;
    }
    
    if (timeRemaining === 'Expired') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
        <AlertCircle className="w-4 h-4" /> Expired
      </span>;
    }
    
    return <span className={`px-3 py-1 ${isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'} rounded-full text-sm font-medium flex items-center gap-1`}>
      <Clock className="w-4 h-4" /> Payment Pending
    </span>;
  };

  const handlePayment = (auction) => {
    setSelectedAuction(auction);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    const updatedAuctions = wonAuctions.filter(a => a.id !== selectedAuction.id);
    setWonAuctions(updatedAuctions);
    setShowPaymentModal(false);
    alert(`Payment of $${selectedAuction.finalBid.toLocaleString()} processed successfully! Order moved to "My Orders" tab.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
        </div>
      </div>

      {/* Notifications Banner */}
      {/*wonAuctions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl"></div>
              <div>
                <p className="font-semibold">Congratulations! You won {wonAuctions.length} auction{wonAuctions.length > 1 ? 's' : ''}!</p>
                <p className="text-sm text-blue-100">Please complete payment within the deadline to secure your purchase.</p>
              </div>
            </div>
          </div>
        </div>
      )*/}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('won')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'won'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Won Auctions ({wonAuctions.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Orders ({myOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'won' && (
          <div className="space-y-4">
            {wonAuctions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No won auctions</h3>
                <p className="text-gray-500">You haven't won any auctions yet. Keep bidding!</p>
              </div>
            ) : (
              wonAuctions.map(auction => (
                <div key={auction.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex gap-6">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{auction.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{auction.category} • {auction.weight}</p>
                          <p className="text-gray-500 text-sm">Seller: {auction.seller}</p>
                        </div>
                        {getStatusBadge(auction.status, auction.paymentDeadline)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Your Winning Bid</p>
                          <p className="text-2xl font-bold text-gray-900">${auction.finalBid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Deadline</p>
                          <p className="text-lg font-semibold text-orange-600 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {calculateTimeRemaining(auction.paymentDeadline)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePayment(auction)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  <img
                    src={order.image}
                    alt={order.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{order.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{order.category} • {order.weight}</p>
                        <p className="text-gray-500 text-sm">Seller: {order.seller}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="text-2xl font-bold text-gray-900">${order.finalBid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="text-lg font-semibold text-blue-600">{order.trackingNumber}</p>
                      </div>
                    </div>

                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Track Shipment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
              <p className="text-gray-600 mt-1">Secure checkout for your winning bid</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="flex gap-4">
                  <img
                    src={selectedAuction.image}
                    alt={selectedAuction.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedAuction.name}</p>
                    <p className="text-sm text-gray-600">{selectedAuction.category} • {selectedAuction.weight}</p>
                    <p className="text-sm text-gray-600">Seller: {selectedAuction.seller}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">${selectedAuction.finalBid.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm font-medium">Card</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg transition ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <p className="text-sm font-medium">PayPal</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-4 border-2 rounded-lg transition ${
                      paymentMethod === 'wire'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏦</div>
                    <p className="text-sm font-medium">Wire</p>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      placeholder="New York"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      placeholder="10001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600">
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Pay ${selectedAuction.finalBid.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuctions;