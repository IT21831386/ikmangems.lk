import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Home from "./pages/home";
import Online from "./pages/onlinepayment";
import PaymentHistory from "./pages/PaymentHistory";

const App = () => {
  return (
    <Routes>
      {/* Wrap all routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/online" element={<Online />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
      </Route>
    </Routes>
  );
};

export default App;
