import { Link } from "./Link";
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
export function AppShell({ role, children, currentPath = window.location.pathname, }) {
    const items = navByRole[role];
    const location = { pathname: currentPath };
    const [notifOpen, setNotifOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    // Close mobile nav on route change
    useEffect(() => {
        setMobileNavOpen(false);
    }, [currentPath]);
    const sidebarContent = (<>
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
            <Wrench className="h-5 w-5"/>
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight">AutoHub</div>
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
            return (<Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/60"}`}>
              <Icon className="h-4 w-4 shrink-0"/>
              {item.label}
            </Link>);
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-sidebar-accent/60">
          <LogOut className="h-4 w-4"/>
          Sign out
        </Link>
      </div>
    </>);
    return (<div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (<>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileNavOpen(false)}/>
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-50">
            {sidebarContent}
          </aside>
        </>)}

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:gap-3 lg:right-8 lg:top-10">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4"/>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"/>
          </button>
          {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)}/>}
          <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-2 sm:px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-sm font-medium capitalize sm:block">{role} User</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="absolute left-4 top-4 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80 lg:top-10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4"/>
        </button>

        <main className="flex-1 overflow-auto px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-20 lg:px-8 lg:pb-8 lg:pt-10">{children}</main>
      </div>
    </div>);
}
function NotifDropdown({ onClose }) {
    return (<>
      <div className="fixed inset-0 z-10" onClick={onClose}/>
      <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-card border border-border rounded-md shadow-lg z-20">
        <div className="p-3 border-b border-border font-medium text-sm">Notifications</div>
        <div className="max-h-80 overflow-auto">
          {[
            { t: "Battery 12V 9Ah critically low (3 left)", time: "2h ago", type: "stock" },
            { t: "Priya Shrestha — Rs. 12,000 unpaid credit", time: "1d ago", type: "credit" },
            { t: "Headlight Bulb H4 below threshold", time: "5h ago", type: "stock" },
        ].map((n, i) => (<div key={i} className="p-3 border-b border-border last:border-0 hover:bg-surface">
              <div className="text-sm">{n.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
            </div>))}
        </div>
      </div>
    </>);
}
