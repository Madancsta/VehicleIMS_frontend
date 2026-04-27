
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PartsManagement from './pages/admin/PartsManagement';
import PurchaseInvoices from './pages/admin/PurchaseInvoices';
import Vendors from './pages/admin/Vendors';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to parts management */}
        <Route path="/" element={<Navigate to="/admin/parts" />} />

        {/* Admin Routes */}
        <Route path="/admin/parts" element={<PartsManagement />} />
        <Route path="/admin/purchases" element={<PurchaseInvoices />} />
        <Route path="/admin/vendors" element={<Vendors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;