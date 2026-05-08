import { PageHeader } from "../../components/PageHeader";
import { customers, vehicles, sales } from "../../lib/dummy-data";
import { useState } from "react";
import { ChevronRight, Phone, Mail, MapPin, Car } from "lucide-react";
function CustomerHistory() {
    const [selectedId, setSelectedId] = useState(customers[0].id);
    const c = customers.find(x => x.id === selectedId);
    const cv = vehicles.filter(v => v.customerId === c.id);
    const cs = sales.filter(s => s.customerId === c.id);
    return (<div>
      <PageHeader title="Customer History" description="Detailed view of customer profile, vehicles and purchases."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">All Customers</div>
          <div>
            {customers.map(x => (<button key={x.id} onClick={() => setSelectedId(x.id)} className={`w-full text-left px-4 py-3 border-b border-border last:border-0 flex items-center justify-between ${selectedId === x.id ? "bg-surface" : "hover:bg-surface/50"}`}>
                <div>
                  <div className="text-sm font-medium">{x.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{x.id}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground"/>
              </button>))}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-2xl font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{c.id} · since {c.joined}</div>
              </div>
              {c.loyalty && <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full">Loyalty member · 10% off</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4"/> {c.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4"/> {c.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4"/> {c.address}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <Stat label="Total Spent" value={`Rs. ${c.totalSpent.toLocaleString()}`}/>
              <Stat label="Outstanding Credit" value={`Rs. ${c.credit.toLocaleString()}`} accent={c.credit > 0}/>
              <Stat label="Total Visits" value={cs.length}/>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4 flex items-center gap-2"><Car className="h-4 w-4"/> Vehicles</div>
            {cv.length ? cv.map(v => (<div key={v.id} className="p-4 rounded-md border border-border mb-2 last:mb-0">
                <div className="font-medium">{v.make} {v.model} ({v.year})</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{v.plate} · {v.type}</div>
              </div>)) : <div className="text-sm text-muted-foreground">No vehicles registered.</div>}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border font-display font-semibold">Purchase History</div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left px-6 py-3">Invoice</th><th className="text-left px-6 py-3">Date</th><th className="text-right px-6 py-3">Items</th><th className="text-right px-6 py-3">Total</th><th className="text-right px-6 py-3">Status</th></tr>
              </thead>
              <tbody>
                {cs.length ? cs.map(s => (<tr key={s.id} className="border-t border-border">
                    <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                    <td className="px-6 py-3 text-muted-foreground">{s.date}</td>
                    <td className="px-6 py-3 text-right">{s.items}</td>
                    <td className="px-6 py-3 text-right font-medium">Rs. {s.total.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>{s.status}</span></td>
                  </tr>)) : <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm">No purchases yet.</td></tr>}
              </tbody>
            </table>
    </div>
          </div>
        </div>
      </div>
    </div>);
}
function Stat({ label, value, accent }) {
    return (<div className="p-3 rounded-md bg-surface">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-xl font-bold mt-1 ${accent ? "text-destructive" : ""}`}>{value}</div>
    </div>);
}
export default CustomerHistory;
