import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { parts } from "../lib/dummy-data";
import { Plus, Edit, Search, AlertTriangle } from "lucide-react";
import { useState } from "react";
function PartsPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    return (<div>
      <PageHeader title="Parts Management" description="Inventory of all spare parts and components." actions={<button onClick={() => setAddOpen(true)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4"/> Add Part
          </button>}/>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input placeholder="Search by name, brand, category…" className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
        <select className="h-10 px-3 rounded-md border border-input bg-card">
          <option>All categories</option>
          <option>Brakes</option><option>Filters</option><option>Lubricants</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
            ["Total parts", parts.length],
            ["Low stock", parts.filter(p => p.stock < p.lowStock).length],
            ["Categories", new Set(parts.map(p => p.category)).size],
            ["Total value", `Rs. ${parts.reduce((s, p) => s + p.stock * p.price, 0).toLocaleString()}`],
        ].map(([l, v]) => (<div key={l} className="stat-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="font-display text-2xl font-bold mt-2">{v}</div>
          </div>))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">SKU</th>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Category</th>
                <th className="text-left px-6 py-3">Brand</th>
                <th className="text-right px-6 py-3">Stock</th>
                <th className="text-right px-6 py-3">Price</th>
                <th className="text-left px-6 py-3">Vendor</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => {
            const low = p.stock < p.lowStock;
            return (<tr key={p.id} className="border-t border-border hover:bg-surface">
                    <td className="px-6 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.brand}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 ${low ? "text-destructive font-medium" : ""}`}>
                        {low && <AlertTriangle className="h-3 w-3"/>}{p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono">Rs. {p.price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.vendor}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => setEditing(p)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface" aria-label="Edit">
                        <Edit className="h-3.5 w-3.5"/>
                      </button>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>

      <PartFormModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Part"/>
      <PartFormModal open={!!editing} onClose={() => setEditing(null)} title="Edit Part" part={editing}/>
    </div>);
}
function PartFormModal({ open, onClose, title, part, }) {
    return (<Modal open={open} onClose={onClose} title={title} description="Part details, pricing, and stock thresholds." size="lg" footer={<>
          <button onClick={onClose} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">Cancel</button>
          <button onClick={onClose} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            {part ? "Save changes" : "Add part"}
          </button>
        </>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name"><input className={inputCls} defaultValue={part?.name ?? ""}/></Field>
        <Field label="Category"><input className={inputCls} defaultValue={part?.category ?? ""}/></Field>
        <Field label="Brand"><input className={inputCls} defaultValue={part?.brand ?? ""}/></Field>
        <Field label="Vendor"><input className={inputCls} defaultValue={part?.vendor ?? ""}/></Field>
        <Field label="Price (Rs.)"><input className={inputCls} type="number" defaultValue={part?.price ?? 0}/></Field>
        <Field label="Stock"><input className={inputCls} type="number" defaultValue={part?.stock ?? 0}/></Field>
        <Field label="Low-stock threshold"><input className={inputCls} type="number" defaultValue={part?.lowStock ?? 5}/></Field>
      </div>
    </Modal>);
}
export default PartsPage;
