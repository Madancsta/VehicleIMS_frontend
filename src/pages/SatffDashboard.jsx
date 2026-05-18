import { Link } from "../components/Link";
import { PageHeader } from "../components/PageHeader";
import { sales, customers, bookings } from "../lib/dummy-data";
import { ShoppingCart, UserPlus, Search, Calendar } from "lucide-react";
function StaffDashboardPage() {
    const today = sales.length;
    const todayRev = sales.reduce((s, x) => s + x.paid, 0);
    return (<div>
      <PageHeader title="Staff Dashboard" description="Quick access to daily operations."/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
            ["Today's Sales", today],
            ["Revenue Today", `Rs. ${todayRev.toLocaleString()}`],
            ["Active Customers", customers.length],
            ["Pending Bookings", bookings.filter(b => b.status === "Pending").length],
        ].map(([l, v]) => (<div key={l} className="stat-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="font-display text-2xl font-bold mt-2">{v}</div>
          </div>))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
            { to: "/staff/sales", label: "New Sale", icon: ShoppingCart },
            { to: "/staff/customer-register", label: "Register Customer", icon: UserPlus },
            { to: "/staff/search", label: "Search Customer", icon: Search },
            { to: "/staff/customers", label: "Customer History", icon: Calendar },
        ].map((a) => {
            const Icon = a.icon;
            return (<Link key={a.to} to={a.to} className="bg-primary text-primary-foreground rounded-lg p-6 hover:opacity-90 transition-opacity">
              <Icon className="h-6 w-6 mb-3"/>
              <div className="font-display font-semibold">{a.label}</div>
            </Link>);
        })}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">Recent Activity</div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">Invoice</th>
              <th className="text-left px-6 py-3">Customer</th>
              <th className="text-left px-6 py-3">Date</th>
              <th className="text-right px-6 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 5).map(s => (<tr key={s.id} className="border-t border-border">
                <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-6 py-3">{s.customer}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.date}</td>
                <td className="px-6 py-3 text-right font-medium">Rs. {s.total.toLocaleString()}</td>
              </tr>))}
          </tbody>
        </table>
    </div>
      </div>
    </div>);
}
export default StaffDashboardPage;
