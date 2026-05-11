import { PageHeader } from "../components/PageHeader";
import { monthlyRevenue, sales } from "../lib/dummy-data";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
function ReportsPage() {
    const totalRev = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
    const totalExp = monthlyRevenue.reduce((s, m) => s + m.expenses, 0);
    const profit = totalRev - totalExp;
    const max = Math.max(...monthlyRevenue.map(m => m.revenue));
    return (<div>
      <PageHeader title="Financial Reports" description="Revenue, expenses, profit and outstanding credits." actions={<button className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface">
            <Download className="h-4 w-4"/> Export PDF
          </button>}/>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue (6mo)</div>
          <div className="font-display text-3xl font-bold mt-2">Rs. {totalRev.toLocaleString()}</div>
          <div className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> +18.2%</div>
        </div>
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Expenses (6mo)</div>
          <div className="font-display text-3xl font-bold mt-2">Rs. {totalExp.toLocaleString()}</div>
          <div className="text-xs text-destructive mt-1 flex items-center gap-1"><TrendingDown className="h-3 w-3"/> -2.4%</div>
        </div>
        <div className="stat-card bg-primary text-primary-foreground border-primary">
          <div className="text-xs uppercase tracking-wider opacity-60">Net Profit</div>
          <div className="font-display text-3xl font-bold mt-2">Rs. {profit.toLocaleString()}</div>
          <div className="text-xs opacity-60 mt-1">{((profit / totalRev) * 100).toFixed(1)}% margin</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="font-display font-semibold mb-6">Monthly breakdown</div>
        <div className="space-y-4">
          {monthlyRevenue.map((m) => (<div key={m.month}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{m.month}</span>
                <span className="font-mono text-muted-foreground">Rs. {m.revenue.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(m.revenue / max) * 100}%` }}/>
              </div>
            </div>))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">Outstanding Credits</div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">Invoice</th>
              <th className="text-left px-6 py-3">Customer</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-right px-6 py-3">Paid</th>
              <th className="text-right px-6 py-3">Pending</th>
            </tr>
          </thead>
          <tbody>
            {sales.filter(s => s.status === "Credit").map(s => (<tr key={s.id} className="border-t border-border">
                <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-6 py-3">{s.customer}</td>
                <td className="px-6 py-3 text-right">Rs. {s.total.toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-muted-foreground">Rs. {s.paid.toLocaleString()}</td>
                <td className="px-6 py-3 text-right font-medium text-destructive">Rs. {(s.total - s.paid).toLocaleString()}</td>
              </tr>))}
          </tbody>
        </table>
    </div>
      </div>
    </div>);
}
export default ReportsPage;

