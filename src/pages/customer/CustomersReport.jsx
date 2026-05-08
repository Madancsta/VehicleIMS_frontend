import { PageHeader } from "../../components/PageHeader";
import { customers } from "../../lib/dummy-data";
import { Award, TrendingUp, AlertCircle } from "lucide-react";
function CustomersReport() {
    const sortedSpend = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
    const regulars = customers.filter(c => c.totalSpent > 50000);
    const credits = customers.filter(c => c.credit > 0);
    return (<div>
      <PageHeader title="Customer Reports" description="Insights into regulars, top spenders and outstanding credits."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReportCard title="Top Spenders" icon={Award} accent="bg-primary text-primary-foreground">
          {sortedSpend.slice(0, 4).map((c, i) => (<div key={c.id} className="flex items-center justify-between py-2.5 border-t border-border first:border-0">
              <div className="flex items-center gap-3">
                <div className="font-display font-bold text-muted-foreground w-5">{i + 1}</div>
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.id}</div>
                </div>
              </div>
              <div className="text-sm font-mono">Rs. {c.totalSpent.toLocaleString()}</div>
            </div>))}
        </ReportCard>

        <ReportCard title="Regular Customers" icon={TrendingUp} accent="bg-success/10 text-success">
          {regulars.map((c) => (<div key={c.id} className="py-2.5 border-t border-border first:border-0">
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">Since {c.joined}</div>
            </div>))}
        </ReportCard>

        <ReportCard title="Pending Credits" icon={AlertCircle} accent="bg-destructive/10 text-destructive">
          {credits.map((c) => (<div key={c.id} className="flex items-center justify-between py-2.5 border-t border-border first:border-0">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.phone}</div>
              </div>
              <div className="text-sm font-mono text-destructive">Rs. {c.credit.toLocaleString()}</div>
            </div>))}
        </ReportCard>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">All Customers</div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Phone</th>
              <th className="text-right px-6 py-3">Total Spent</th>
              <th className="text-right px-6 py-3">Credit</th>
              <th className="text-right px-6 py-3">Loyalty</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (<tr key={c.id} className="border-t border-border hover:bg-surface">
                <td className="px-6 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-6 py-3 font-medium">{c.name}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{c.phone}</td>
                <td className="px-6 py-3 text-right">Rs. {c.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">{c.credit > 0 ? <span className="text-destructive">Rs. {c.credit.toLocaleString()}</span> : "—"}</td>
                <td className="px-6 py-3 text-right">{c.loyalty ? <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">10% off</span> : "—"}</td>
              </tr>))}
          </tbody>
        </table>
    </div>
      </div>
    </div>);
}
function ReportCard({ title, icon: Icon, accent, children }) {
    return (<div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4"/>
        </div>
        <div className="font-display font-semibold">{title}</div>
      </div>
      <div>{children}</div>
    </div>);
}
export default CustomersReport;
