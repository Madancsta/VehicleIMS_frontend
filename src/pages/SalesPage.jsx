import { PageHeader } from "../components/PageHeader";
import { parts, customers } from "../lib/dummy-data";
import { Plus, Trash2, Mail, Printer } from "lucide-react";
import { useState } from "react";
function SalesPage() {
    const [items, setItems] = useState([
        { partId: "P-1001", name: "Brake Pad — Front", qty: 2, price: 2400 },
        { partId: "P-1002", name: "Engine Oil 10W-40 (1L)", qty: 1, price: 850 },
    ]);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discount = Math.round(subtotal * 0.1);
    const total = subtotal - discount;
    return (<div>
      <PageHeader title="Sales / Invoice" description="Create a new sale and generate invoice."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4">Customer</div>
            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
              {customers.map(c => <option key={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="font-display font-semibold">Items</div>
              <button className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1.5"><Plus className="h-3.5 w-3.5"/> Add Part</button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Part</th>
                  <th className="text-right px-6 py-3">Qty</th>
                  <th className="text-right px-6 py-3">Price</th>
                  <th className="text-right px-6 py-3">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => (<tr key={idx} className="border-t border-border">
                    <td className="px-6 py-3 font-medium">{i.name}</td>
                    <td className="px-6 py-3 text-right">{i.qty}</td>
                    <td className="px-6 py-3 text-right font-mono">Rs. {i.price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-medium">Rs. {(i.qty * i.price).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => setItems(items.filter((_, x) => x !== idx))} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface text-destructive">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
    </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4">Quick add part</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {parts.slice(0, 6).map(p => (<button key={p.id} onClick={() => setItems([...items, { partId: p.id, name: p.name, qty: 1, price: p.price }])} className="p-3 rounded-md border border-border hover:bg-surface text-left">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">Rs. {p.price.toLocaleString()}</div>
                </button>))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-8">
          <div className="font-display font-semibold mb-4">Invoice Summary</div>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`}/>
            <Row label="Loyalty discount (10%)" value={`- Rs. ${discount.toLocaleString()}`} muted/>
            <div className="border-t border-border pt-3 mt-3">
              <Row label="Total" value={`Rs. ${total.toLocaleString()}`} bold/>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Payment</label>
            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option>Cash</option><option>Card</option><option>Credit</option>
            </select>
          </div>

          <button className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium mt-4">Complete Sale</button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5"><Printer className="h-4 w-4"/> Print</button>
            <button className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5"><Mail className="h-4 w-4"/> Email</button>
          </div>
        </div>
      </div>
    </div>);
}
function Row({ label, value, muted, bold }) {
    return (<div className="flex justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-mono ${bold ? "font-bold text-base" : ""}`}>{value}</span>
    </div>);
}
export default SalesPage;
