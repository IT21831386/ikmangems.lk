import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Home from "./pages/home";
import Online from "./pages/onlinepayment";
import PaymentHistory from "./pages/PaymentHistory";
import Auction from "./pages/Auction/auction_page";
import AuctionDetails from "./pages/Auction/auction_details";
import AdminPaymentStatus from "./pages/adminPaymentStatus";
//import NoteDetailPage from "./pages/NoteDetailPage";
//import toast from "react-hot-toast";


//import { BrowserRouter, Routes, Route } from "react-router-dom";
//import Home from "./pages/Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/bidderDashboard";
//import DashboardPage from "./pages/sellerDashboard";
import ForgotPassword from "./auth/ForgotPassword";
//import { Routes } from "react-router-dom";
import UserManagement from "./pages/manageUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import BidderDashboard from "./pages/bidderDashboard";

const App = () => {
  return (
    <Routes>
      {/* Wrap all routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/online" element={<Online />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/auction-details" element={<AuctionDetails />} />
        <Route path="/admin-payment-status" element={<AdminPaymentStatus />} />
      </Route>

       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/signup" element={<Signup />} />
       <Route
          path="/bidder-dashboard"
          element={
            <ProtectedRoute>
              <BidderDashboard />
            </ProtectedRoute>
          }
       />
       <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/manage-users" element={<UserManagement />} />

    </Routes>
  );
};

export default App;
