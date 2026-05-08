import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PartsManagement from "./pages/admin/PartsManagement";
import PurchaseInvoices from "./pages/admin/PurchaseInvoices";
import Vendors from "./pages/admin/Vendors";

import RegisterPage from "./pages/customer/Register";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProfileVehiclePage from "./pages/customer/ProfileVehiclePage";
import BookingRequestReviewPage from "./pages/customer/BookingRequestReviewPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/register" />} />

        <Route path="/customer/register" element={<RegisterPage />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<ProfileVehiclePage />} />
        <Route
          path="/customer/service"
          element={<BookingRequestReviewPage />}
        />

        <Route path="/admin/parts" element={<PartsManagement />} />
        <Route path="/admin/purchases" element={<PurchaseInvoices />} />
        <Route path="/admin/vendors" element={<Vendors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
