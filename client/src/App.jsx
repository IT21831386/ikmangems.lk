import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Home from "./pages/home";
import Online from "./pages/onlinepayment";
import PaymentHistory from "./pages/PaymentHistory";
import Auction from "./pages/Auction/auction_page";
import AuctionDetails from "./pages/Auction/auction_details";

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
      </Route>
    </Routes>
  );
};

export default App;
