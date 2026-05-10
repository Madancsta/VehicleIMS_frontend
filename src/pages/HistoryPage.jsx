import { PageHeader } from "../components/PageHeader";
import { sales } from "../lib/dummy-data";
import { Download, Mail } from "lucide-react";
function HistoryPage() {
    const my = sales.filter(s => s.customerId === "C-2001" || s.customerId === "C-2002");
    const total = my.reduce((s, x) => s + x.total, 0);
    return (<div>
      <PageHeader title="Purchase History" description="All your past invoices and purchases."/>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[["Total Invoices", my.length], ["Total Spent", `Rs. ${total.toLocaleString()}`], ["This Month", "Rs. 8,600"]].map(([l, v]) => (<div key={l} className="stat-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="font-display text-2xl font-bold mt-2">{v}</div>
          </div>))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">Invoice</th>
              <th className="text-left px-6 py-3">Date</th>
              <th className="text-right px-6 py-3">Items</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-right px-6 py-3">Status</th>
              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {my.map(s => (<tr key={s.id} className="border-t border-border hover:bg-surface">
                <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.date}</td>
                <td className="px-6 py-3 text-right">{s.items}</td>
                <td className="px-6 py-3 text-right font-medium">Rs. {s.total.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>{s.status}</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-background"><Download className="h-3.5 w-3.5"/></button>
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-background"><Mail className="h-3.5 w-3.5"/></button>
                </td>
              </tr>))}
          </tbody>
        </table>
    </div>
      </div>
    </div>);
}
export default HistoryPage;
