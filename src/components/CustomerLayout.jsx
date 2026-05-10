import { Bell, Calendar, History, LayoutDashboard, LogOut, Menu, Wrench, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "./Link";
import logo from "../assets/gear.png";

const navItems = [
  { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Booking & Reviews", path: "/customer/service", icon: Calendar },
  { label: "Purchase History", path: "/customer/history", icon: History },
];

export default function CustomerLayout({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        <div className="absolute right-4 top-10 z-20 flex items-center gap-2 sm:right-6 sm:gap-3 lg:right-8">
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} />}

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
          className="absolute left-4 top-10 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface/80 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <main className="flex-1 overflow-auto px-4 pt-10 pb-4 sm:px-6 sm:pt-10 sm:pb-6 lg:px-8 lg:pt-10 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NotifDropdown({ onClose }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-10"
        onClick={onClose}
      />

      <div className="absolute right-0 top-12 z-20 w-[calc(100vw-2rem)] max-w-sm rounded-md border border-border bg-card shadow-lg sm:w-80">
        <div className="border-b border-border p-3 text-sm font-medium">Notifications</div>

        <div className="max-h-80 overflow-auto">
          {[
            { text: "Part stock alerts will appear here", time: "System" },
            { text: "Credit reminders will appear here", time: "System" },
          ].map((item) => (
            <div
              key={item.text}
              className="border-b border-border p-3 last:border-0 hover:bg-surface"
            >
              <div className="text-sm">{item.text}</div>

              <div className="mt-1 text-xs text-muted-foreground">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
