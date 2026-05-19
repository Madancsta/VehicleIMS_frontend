import { Link } from "./Link";
import logo from "../assets/gear.png";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  FileText,
  ShoppingCart,
  UserPlus,
  Search,
  BarChart3,
  Calendar,
  Bell,
  LogOut,
  History,
  User,
  Menu,
  X,
  PackageOpen,
  CreditCard,
  AlertTriangle,
  PackageSearch,
} from "lucide-react";
import { useState, useEffect } from "react";

const navByRole = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/staff", label: "Staff", icon: Users },
    { to: "/admin/parts", label: "Parts", icon: Package },
    { to: "/admin/part-requests", label: "Part Requests", icon: PackageSearch },
    { to: "/admin/vendors", label: "Vendors", icon: Truck },
    { to: "/admin/purchases", label: "Purchase Invoices", icon: FileText },
    { to: "/admin/reports", label: "Financial Reports", icon: BarChart3 },
    { to: "/admin/customers-report", label: "Customer Reports", icon: BarChart3 },
  ],
  staff: [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
    { to: "/staff/sales", label: "Sales / Invoice", icon: ShoppingCart },
    { to: "/staff/part-requests", label: "Part Requests", icon: PackageSearch },
    { to: "/staff/customer-register", label: "Register Customer", icon: UserPlus },
    { to: "/staff/search", label: "Search", icon: Search },
    { to: "/staff/customers", label: "Customer History", icon: History },
  ],
  customer: [
    { to: "/customer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customer/profile", label: "Profile & Vehicle", icon: User },
    { to: "/customer/booking", label: "Booking & Reviews", icon: Calendar },
    { to: "/customer/history", label: "Purchase History", icon: History },
  ],
};

export function AppShell({ role, children, currentPath = window.location.pathname }) {
  const items = navByRole[role] || [];
  const location = { pathname: currentPath };

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    lowStockCount: 0,
    unpaidCreditCount: 0,
  });

  const API_URL = "http://localhost:5229/api/notification";
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const response = await fetch(`${API_URL}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    setMobileNavOpen(false);
  }, [currentPath]);

  const totalUnread =
    summary.totalUnread ?? (summary.lowStockCount || 0) + (summary.unpaidCreditCount || 0);

  const refreshNotifications = async () => {
    await Promise.all([fetchNotifications(), fetchSummary()]);
  };

  const markNotificationAsRead = async (notification) => {
    if (!token || !notification?.id || notification.isRead) return;

    try {
      const response = await fetch(`${API_URL}/${notification.id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id && item.type === notification.type
              ? { ...item, isRead: true }
              : item,
          ),
        );
        setSummary((current) => {
          const lowStockUnread =
            notification.type === "LowStock" || notification.type === "OutOfStock";
          const unpaidCreditUnread = notification.type === "UnpaidCredit";

          return {
            ...current,
            lowStockCount: lowStockUnread
              ? Math.max((current.lowStockCount || 0) - 1, 0)
              : current.lowStockCount,
            unpaidCreditCount: unpaidCreditUnread
              ? Math.max((current.unpaidCreditCount || 0) - 1, 0)
              : current.unpaidCreditCount,
            totalUnread: Math.max((current.totalUnread || totalUnread || 0) - 1, 0),
          };
        });
        await refreshNotifications();
      } else {
        console.error("Failed to mark notification as read:", await response.text());
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token || notifications.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
        setSummary((current) => ({
          ...current,
          lowStockCount: 0,
          unpaidCreditCount: 0,
          totalUnread: 0,
        }));
        await refreshNotifications();
      } else {
        console.error("Failed to mark all notifications as read:", await response.text());
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

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
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const sidebarContent = (
    <>
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Gearix Logo" className="w-full px-4 brightness-0 invert" />
        </div>

        <button
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden h-8 w-8 rounded-md hover:bg-sidebar-accent/60 flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/"
          onClick={handleSignOut}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors hover:!text-red-500"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
          Sign out
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileNavOpen(false)}
          />

          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-50">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="relative flex-1 flex flex-col min-w-0 lg:ml-64">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="absolute left-4 top-4 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:gap-3 lg:right-8 lg:top-10">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />

            {totalUnread > 0 && (
              <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
                {totalUnread}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotifDropdown
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              loading={loading}
              formatTime={formatTime}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
            />
          )}

          <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-2 sm:px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {role.charAt(0).toUpperCase()}
            </div>

            <div className="hidden text-sm font-medium capitalize sm:block">{role} User</div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-20 lg:px-8 lg:pb-8 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function NotifDropdown({
  onClose,
  notifications = [],
  loading = false,
  formatTime,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  const getIconByType = (type) => {
    if (type === "LowStock") return <PackageOpen className="h-4 w-4" />;
    if (type === "OutOfStock") return <AlertTriangle className="h-4 w-4" />;
    if (type === "UnpaidCredit") return <CreditCard className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />

      <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-card border border-border rounded-md shadow-lg z-20">
        <div className="p-3 border-b border-border font-medium text-sm flex justify-between items-center">
          <span>Notifications</span>

          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">{notifications.length} total</span>
          )}
        </div>

        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n) => (
              <button
                key={`${n.type}-${n.id}`}
                type="button"
                onClick={() => onMarkAsRead?.(n)}
                className={`w-full p-3 text-left border-b border-border last:border-0 hover:bg-surface transition-colors ${
                  n.isRead ? "opacity-70" : "bg-surface/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface shrink-0">
                    {getIconByType(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {!n.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                        )}
                        <div className="truncate text-sm font-medium">{n.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime
                          ? formatTime(n.createdAt)
                          : n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ""}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-2 border-t border-border">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="w-full text-center text-xs text-muted-foreground py-1 hover:text-foreground transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}
