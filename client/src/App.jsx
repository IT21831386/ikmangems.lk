import { Route, Routes } from "react-router";

import HomePage from "./pages/payment_home";
import Online from "./pages/onlinepayment";
import PaymentHistory from "./pages/PaymentHistory";
import AdminPaymentStatus from "./pages/adminPaymentStatus";
//import NoteDetailPage from "./pages/NoteDetailPage";
//import toast from "react-hot-toast";

const App = () => {
  return (
    <div data-theme="forest">
      
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/online" element={<Online />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/admin-payment-status" element={<AdminPaymentStatus />} />
      </Routes>
    </div>
  );
};
export default App;


// <Route path="/note/:id" element={<NoteDetailPage />} />
//<div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />