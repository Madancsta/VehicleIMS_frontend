import { Link } from "./Link";
import logo from "../assets/gear.png"; // Fixed import - no curly braces for default export
import { LayoutDashboard, Users, Package, Truck, FileText, ShoppingCart, UserPlus, Search, BarChart3, Calendar, Bell, LogOut, Wrench, History, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navByRole = {
    admin: [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/staff", label: "Staff", icon: Users },
        { to: "/admin/parts", label: "Parts", icon: Package },
        { to: "/admin/vendors", label: "Vendors", icon: Truck },
        { to: "/admin/purchases", label: "Purchase Invoices", icon: FileText },
        { to: "/admin/reports", label: "Financial Reports", icon: BarChart3 },
        { to: "/admin/customers-report", label: "Customer Reports", icon: BarChart3 },
    ],
    staff: [
        { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
        { to: "/staff/sales", label: "Sales / Invoice", icon: ShoppingCart },
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
    const items = navByRole[role];
    const location = { pathname: currentPath };
    const [notifOpen, setNotifOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ lowStockCount: 0, unpaidCreditCount: 0 });

    const API_URL = "http://localhost:5229/api/notification";
    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    const fetchSummary = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/summary`, {
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
        // Refresh every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
            fetchSummary();
        }, 30000);
        return () => clearInterval(interval);
    }, [token]);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileNavOpen(false);
    }, [currentPath]);


    const totalUnread = (summary.lowStockCount || 0) + (summary.unpaidCreditCount || 0);

    const sidebarContent = (
        <>
            <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="Gearix Logo" className="h-5 w-5 object-contain"/>
                    </div>
                    <div>
                        <div className="font-display text-lg font-bold tracking-tight">Gearix</div>
                        <div className="text-[10px] uppercase tracking-widest opacity-60">{role} panel</div>
                    </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="lg:hidden h-8 w-8 rounded-md hover:bg-sidebar-accent/60 flex items-center justify-center" aria-label="Close menu">
                    <X className="h-4 w-4"/>
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.to;
                    return (
                        <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "hover:bg-sidebar-accent/60"}`}>
                            <Icon className="h-4 w-4 shrink-0"/>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-sidebar-border">
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-sidebar-accent/60" onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("roles");
        }}>
                    <LogOut className="h-4 w-4"/>
                    Sign out
                </Link>
            </div>
        </>
    );


    return (
        <div className="min-h-screen flex bg-background">
            {/* Desktop sidebar - fixed */}
            <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar drawer */}
            {mobileNavOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileNavOpen(false)}/>
                    <aside className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-50">
                        {sidebarContent}
                    </aside>
                </>
            )}

            {/* Main content area with left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sticky top-0 z-30 bg-card">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setMobileNavOpen(true)} className="lg:hidden h-10 w-10 rounded-md border border-border hover:bg-surface flex items-center justify-center shrink-0" aria-label="Open menu">
                            <Menu className="h-4 w-4"/>
                        </button>
                        <div className="min-w-0">
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                                {role}
                            </div>
                            <div className="font-display font-semibold truncate text-sm sm:text-base">
                                {items.find((i) => i.to === location.pathname)?.label || "Overview"}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
                        <button onClick={() => setNotifOpen((v) => !v)} className="relative h-10 w-10 rounded-md border border-border hover:bg-surface flex items-center justify-center" aria-label="Notifications">
                            <Bell className="h-4 w-4"/>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"/>
                        </button>
                        {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)}/>}
                        <div className="h-10 px-2 sm:px-3 rounded-md bg-surface border border-border flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {role.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-sm font-medium capitalize">{role} User</div>
                        </div>
                    </div>
                </header>
                
                {/* Only this main content area scrolls */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NotifDropdown({ onClose, notifications, loading }) {
    const getIconByType = (type) => {
        if (type === "LowStock") return "📦";
        if (type === "UnpaidCredit") return "💰";
        return "🔔";
    };

    const getColorByType = (type) => {
        if (type === "LowStock") return "text-orange-500";
        if (type === "UnpaidCredit") return "text-red-500";
        return "text-blue-500";
    };

    return (<>
      <div className="fixed inset-0 z-10" onClick={onClose}/>
      <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-card border border-border rounded-md shadow-lg z-20">
        <div className="p-3 border-b border-border font-medium text-sm flex justify-between items-center">
          <span>Notifications</span>
          {notifications?.length > 0 && (
            <span className="text-xs text-muted-foreground">{notifications.length} total</span>
          )}
        </div>
        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-3 border-b border-border last:border-0 hover:bg-surface">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getIconByType(n.type)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t border-border">
          <button className="w-full text-center text-xs text-muted-foreground py-1 hover:text-foreground">
            Mark all as read
          </button>
        </div>
      </div>
    </>);
}