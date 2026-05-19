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
  const [displayCount, setDisplayCount] = useState(5); // Show 5 initially
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalUnread: 0 });

  const token = localStorage.getItem("accessToken");

  // Fetch customer notifications from the customer endpoint
  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customer/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer notification summary
  const fetchSummary = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/customer/notifications/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary({
          totalUnread: data.totalUnread || 0
        });
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

  const totalUnread = summary.totalUnread || 0;

  const getNotificationIcon = (type) => {
    if (type === "Booking") return "📅";
    if (type === "PartRequest") return "🔧";
    if (type === "Service") return "✅";
    return "🔔";
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const handleShowLess = () => {
    setDisplayCount(5);
  };

  const displayedNotifications = notifications.slice(0, displayCount);
  const hasMore = displayCount < notifications.length;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-6">
        <div className="flex items-center">
            <img src={logo} alt="Gearix Logo" className="w-full px-4 brightness-0 invert" />
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
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

      <div className="relative flex min-w-0 flex-1 flex-col lg:ml-64">
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
              notifications={displayedNotifications}
              allNotifications={notifications}
              loading={loading}
              hasMore={hasMore}
              onShowMore={handleShowMore}
              onShowLess={handleShowLess}
              currentCount={displayCount}
              totalCount={notifications.length}
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

function NotifDropdown({ 
  onClose, 
  notifications, 
  allNotifications, 
  loading, 
  hasMore, 
  onShowMore, 
  onShowLess,
  currentCount,
  totalCount 
}) {
  const getNotificationIcon = (type) => {
    if (type === "Booking") return "📅";
    if (type === "PartRequest") return "🔧";
    if (type === "Service") return "✅";
    return "🔔";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      <div className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-border bg-card shadow-lg sm:w-96">
        <div className="border-b border-border p-3 text-sm font-medium flex justify-between items-center">
          <span>Notifications</span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">{totalCount} total</span>
          )}
        </div>
        
        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <>
              {notifications.map((n, i) => (
                <div key={i} className="border-b border-border p-3 last:border-0 hover:bg-surface transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(n.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(n.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                      {n.status && (
                        <span className={`inline-block mt-2 px-1.5 py-0.5 rounded text-xs ${
                          n.status === "Completed" || n.status === "Approved" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {n.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show More / Show Less Buttons */}
              <div className="p-2 border-t border-border">
                {hasMore ? (
                  <button
                    onClick={onShowMore}
                    className="w-full text-center text-xs text-primary py-2 hover:underline"
                  >
                    Show more ({currentCount} of {totalCount})
                  </button>
                ) : totalCount > 5 ? (
                  <button
                    onClick={onShowLess}
                    className="w-full text-center text-xs text-muted-foreground py-2 hover:underline"
                  >
                    Show less
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
        
        <div className="p-2 border-t border-border">
          <button className="w-full text-center text-xs text-muted-foreground py-1 hover:text-foreground transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}