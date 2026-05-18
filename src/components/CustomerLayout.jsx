import { Bell, Calendar, History, LayoutDashboard, LogOut, Menu, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "./Link";
import logo from "../assets/gear.png";

const navItems = [
  { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Booking & Reviews", path: "/customer/service", icon: Calendar },
  { label: "Purchase History", path: "/customer/history", icon: History },
];

const API_BASE_URL = "https://localhost:7280/api";

export default function CustomerLayout({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ lowStockCount: 0, unpaidCreditCount: 0 });

  const token = localStorage.getItem("accessToken");

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notification/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notification/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    window.addEventListener("app:navigate", syncPath);
    return () => {
      window.removeEventListener("popstate", syncPath);
      window.removeEventListener("app:navigate", syncPath);
    };
  }, []);

  const handleSignOut = () => {
    [
      "token",
      "accessToken",
      "refreshToken",
      "roles",
      "customerId",
      "userId",
      "userEmail",
      "email",
      "userName",
    ].forEach((key) => localStorage.removeItem(key));
    setMobileNavOpen(false);
  };

  const totalUnread = (summary.lowStockCount || 0) + (summary.unpaidCreditCount || 0);

  const getNotificationIcon = (type) => {
    if (type === "LowStock") return "📦";
    if (type === "UnpaidCredit") return "💰";
    return "🔔";
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <img src={logo} alt="Gearix" className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight">Gearix</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">customer panel</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent/60 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = path === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/"
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-sidebar-accent/60"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        {sidebarContent}
      </aside>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Notification + Profile */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:gap-3 lg:right-8 lg:top-10">
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs text-white">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotifDropdown 
              onClose={() => setNotifOpen(false)} 
              notifications={notifications}
              loading={loading}
            />
          )}

          <Link
            to="/customer/profile"
            className={`flex h-10 items-center gap-2 rounded-md border px-2 transition-colors hover:bg-surface/80 sm:px-3 ${
              path === "/customer/profile"
                ? "border-primary bg-surface"
                : "border-border bg-surface"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              C
            </div>
            <div className="hidden text-sm font-medium sm:block">Profile</div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="absolute left-4 top-4 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <main className="flex-1 overflow-auto px-4 pt-20 pb-4 sm:px-6 sm:pt-20 sm:pb-6 lg:px-8 lg:pt-10 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NotifDropdown({ onClose, notifications, loading }) {
  const getNotificationIcon = (type) => {
    if (type === "LowStock") return "📦";
    if (type === "UnpaidCredit") return "💰";
    return "🔔";
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      <div className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-border bg-card shadow-lg sm:w-80">
        <div className="border-b border-border p-3 text-sm font-medium flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">{notifications.length} total</span>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="border-b border-border p-3 last:border-0 hover:bg-surface">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getNotificationIcon(n.type)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}