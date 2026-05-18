import { useEffect, useMemo, useState } from "react";

import { AppShell } from "./components/AppShell.jsx";

import AdminDashboardPage from "./pages/AdminDashboard.jsx";
import BookingRequestReviewPage from "./pages/BookingRequestReviewPage.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import CustomerHistory from "./pages/CustomerHistory.jsx";
import CustomerRegister from "./pages/CustomerRegister.jsx";
import CustomersReport from "./pages/CustomersReport.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PartsPage from "./pages/PartsPage.jsx";
import ProfileVehiclePage from "./pages/ProfileVehiclePage.jsx";
import PurchasesPage from "./pages/PurchasesPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import StaffDashboardPage from "./pages/SatffDashboard.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import StaffCustomerRegister from "./pages/StaffCustomerRegister.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import VendorsPage from "./pages/VendorsPage.jsx";

import "./style.css";

const pages = {
  "/": LoginPage,
  "/register": CustomerRegister,

  // Admin routes
  "/admin": AdminDashboardPage,
  "/admin/customers-report": CustomersReport,
  "/admin/customer-details": CustomerDetails,
  "/admin/parts": PartsPage,
  "/admin/purchases": PurchasesPage,
  "/admin/reports": ReportPage,
  "/admin/staff": StaffPage,
  "/admin/vendors": VendorsPage,

  // Customer routes
  "/customer": CustomerDashboard,
  "/customer/dashboard": CustomerDashboard,
  "/customer/history": HistoryPage,
  "/customer/profile": ProfileVehiclePage,
  "/customer/register": CustomerRegister,
  "/customer/service": BookingRequestReviewPage,

  // Staff routes
  "/staff": StaffDashboardPage,
  "/staff/customer-register": StaffCustomerRegister,
  "/staff/customers": CustomerHistory,
  "/staff/sales": SalesPage,
  "/staff/search": SearchPage,
};

function roleByPath(path) {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/staff")) return "staff";
  if (path.startsWith("/customer")) return "customer";
  return null;
}

function getPath() {
  return window.location.pathname || "/";
}

export default function App() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const syncPath = () => setPath(getPath());

    window.addEventListener("popstate", syncPath);
    window.addEventListener("app:navigate", syncPath);

    return () => {
      window.removeEventListener("popstate", syncPath);
      window.removeEventListener("app:navigate", syncPath);
    };
  }, []);

  const token = localStorage.getItem("token");
  const role = roleByPath(path);
  const isProtectedRoute = role !== null && path !== "/" && path !== "/register";

  // Redirect to login if not authenticated
  if (isProtectedRoute && !token) {
    window.location.href = "/";
    return null;
  }

  const Page = useMemo(() => pages[path] || pages["/"], [path]);

  if (role && role !== "customer") {
    return (
      <AppShell role={role} currentPath={path}>
        <Page />
      </AppShell>
    );
  }

  return <Page />;
}