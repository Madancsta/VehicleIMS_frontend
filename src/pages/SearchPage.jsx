import { PageHeader } from "../components/PageHeader";
import { customers, vehicles, parts } from "../lib/dummy-data";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
function SearchPage() {
    const [q, setQ] = useState("");
    const [tab, setTab] = useState("customers");
    const fc = customers.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q) || c.email.includes(q));
    const fv = vehicles.filter(v => !q || v.plate.toLowerCase().includes(q.toLowerCase()) || v.model.toLowerCase().includes(q.toLowerCase()));
    const fp = parts.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()));
    return (<div>
      <PageHeader title="Search" description="Find customers, vehicles, or parts instantly."/>

      <div className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type a name, phone, plate, brand…" className="w-full h-14 pl-12 pr-4 text-lg rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"/>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {[["customers", `Customers (${fc.length})`], ["vehicles", `Vehicles (${fv.length})`], ["parts", `Parts (${fp.length})`]].map(([k, l]) => (<button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${tab === k ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground"}`}>{l}</button>))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {tab === "customers" && (<div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">ID</th><th className="text-left px-6 py-3">Name</th><th className="text-left px-6 py-3">Phone</th><th className="text-left px-6 py-3">Email</th></tr>
            </thead>
            <tbody>
              {fc.map(c => (<tr key={c.id} className="border-t border-border hover:bg-surface cursor-pointer">
                  <td className="px-6 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-6 py-3 font-medium">{c.name}</td>
                  <td className="px-6 py-3 font-mono text-xs">{c.phone}</td>
                  <td className="px-6 py-3 text-muted-foreground">{c.email}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
        {tab === "vehicles" && (<div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">Plate</th><th className="text-left px-6 py-3">Vehicle</th><th className="text-left px-6 py-3">Year</th><th className="text-left px-6 py-3">Type</th></tr>
            </thead>
            <tbody>
              {fv.map(v => (<tr key={v.id} className="border-t border-border hover:bg-surface">
                  <td className="px-6 py-3 font-mono text-xs">{v.plate}</td>
                  <td className="px-6 py-3 font-medium">{v.make} {v.model}</td>
                  <td className="px-6 py-3">{v.year}</td>
                  <td className="px-6 py-3 text-muted-foreground">{v.type}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
        {tab === "parts" && (<div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">SKU</th><th className="text-left px-6 py-3">Name</th><th className="text-left px-6 py-3">Brand</th><th className="text-right px-6 py-3">Stock</th><th className="text-right px-6 py-3">Price</th></tr>
            </thead>
            <tbody>
              {fp.map(p => (<tr key={p.id} className="border-t border-border hover:bg-surface">
                  <td className="px-6 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.brand}</td>
                  <td className="px-6 py-3 text-right">{p.stock}</td>
                  <td className="px-6 py-3 text-right font-mono">Rs. {p.price.toLocaleString()}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
      </div>
    </div>);
}
export default SearchPage;
