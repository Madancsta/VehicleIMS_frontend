import { PageHeader } from "../../components/PageHeader";
import { monthlyRevenue, sales, parts, customers, notifications } from "../../lib/dummy-data";
import { TrendingUp, Users, Package, AlertTriangle, DollarSign } from "lucide-react";
function AdminDashboard() {
    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
    const totalCredit = sales.reduce((s, x) => s + (x.total - x.paid), 0);
    const lowStock = parts.filter((p) => p.stock < p.lowStock).length;
    const maxRev = Math.max(...monthlyRevenue.map((m) => m.revenue));
    const stats = [
        { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+12.4%" },
        { label: "Active Customers", value: customers.length, icon: Users, change: "+3 this month" },
        { label: "Parts in stock", value: parts.length, icon: Package, change: `${lowStock} low` },
        { label: "Outstanding Credit", value: `Rs. ${totalCredit.toLocaleString()}`, icon: TrendingUp, change: "Review needed" },
    ];
    return (<div>
      <PageHeader title="Admin Dashboard" description="Real-time overview of your workshop's operations."/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
            const Icon = s.icon;
            return (<div key={s.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="font-display text-2xl font-bold mt-2">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
                </div>
                <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center">
                  <Icon className="h-4 w-4"/>
                </div>
              </div>
            </div>);
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-display font-semibold">Revenue vs Expenses</div>
              <div className="text-xs text-muted-foreground">Last 6 months</div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary"/> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground"/> Expenses</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-56">
            {monthlyRevenue.map((m) => (<div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end gap-1 h-full">
                  <div className="flex-1 bg-primary rounded-t" style={{ height: `${(m.revenue / maxRev) * 100}%` }}/>
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: `${(m.expenses / maxRev) * 100}%` }}/>
                </div>
                <div className="text-xs text-muted-foreground">{m.month}</div>
              </div>))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning"/> Alerts
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (<div key={n.id} className="p-3 rounded-md bg-surface border border-border">
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
              </div>))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">Recent Sales</div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">Invoice</th>
              <th className="text-left px-6 py-3">Customer</th>
              <th className="text-left px-6 py-3">Date</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-right px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 5).map((s) => (<tr key={s.id} className="border-t border-border hover:bg-surface">
                <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-6 py-3">{s.customer}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.date}</td>
                <td className="px-6 py-3 text-right font-medium">Rs. {s.total.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${s.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>{s.status}</span>
                </td>
              </tr>))}
          </tbody>
        </table>
    </div>
      </div>
    </div>);
}
export default AdminDashboard;
