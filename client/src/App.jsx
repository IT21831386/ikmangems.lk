import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Home from "./pages/home";
import PaymentForm from "./pages/payment_home";
import Online from "./pages/onlinepayment";
import PaymentHistory from "./pages/PaymentHistory";
import Auction from "./pages/Auction/auction_page";
import AuctionDetails from "./pages/Auction/auction_details";
import AdminPaymentStatus from "./pages/adminPaymentStatus";
//import NoteDetailPage from "./pages/NoteDetailPage";
//import toast from "react-hot-toast";

//import { BrowserRouter, Routes, Route } from "react-router-dom";
//import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
//import Dashboard from "./pages/bidderDashboard";
//import DashboardPage from "./pages/sellerDashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
//import { Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import BidderDashboard from "./pages/user/bidderDashboard";

// ✅ keep only ONE SellerDashboard import:
import SellerDashboard from "./pages/seller/SellerDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import VerifyEmail from "./pages/auth/VerifyEmail";
import GetOTP from "./pages/auth/getOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import AccountSettings from "./pages/user/AccountSettings";
import DisplayUsers from "./pages/admin-um/DisplayUsers";
import OrderHistoryPage from "./pages/user/OrderHistoryPage";
import EditUsers from "./pages/admin-um/EditUsers";

const App = () => {
  return (
    <Routes>
      {/* Wrap all routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/payment-form" element={<PaymentForm />} />
        <Route path="/online" element={<Online />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/auction-details" element={<AuctionDetails />} />
        <Route path="/admin-payment-status" element={<AdminPaymentStatus />} />
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/get-otp" element={<GetOTP />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/bidder-dashboard"
        element={
          <ProtectedRoute>
            <BidderDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* ✅ one seller-dashboard route */}
      <Route path="/seller-dashboard" element={<SellerDashboard />} />

      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/display-users" element={<DisplayUsers />} />
      <Route path="/order-history" element={<OrderHistoryPage />} />
      <Route path="/edit-users" element={<EditUsers />} />
    </Routes>
  );
};

export default App;
