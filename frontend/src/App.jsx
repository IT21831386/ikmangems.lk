import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Gemstone from "./pages/Gemstone.jsx"; // your form component
import GemDisplay from "./pages/GemDisplay.jsx"; // optional details page
import CRUDStatus from "./components/CRUDStatus.jsx"; // CRUD status indicator
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gemstone />} />
        <Route path="/gemsdetails" element={<GemDisplay />} />
      </Routes>
      {/* CRUD Status Indicator - shows on all pages */}
      <CRUDStatus />
      {/* Global toaster for app-wide notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}
