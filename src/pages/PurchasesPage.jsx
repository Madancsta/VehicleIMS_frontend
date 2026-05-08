import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { purchaseInvoices, parts } from "../lib/dummy-data";
import { Plus, Download, Eye } from "lucide-react";
import { useState } from "react";
function PurchasesPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [viewing, setViewing] = useState(null);
    return (<div>
      <PageHeader title="Purchase Invoices" description="Stock purchase records and vendor invoices." actions={<button onClick={() => setAddOpen(true)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4"/> New Invoice
          </button>}/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Invoice</th>
                  <th className="text-left px-6 py-3">Vendor</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-right px-6 py-3">Items</th>
                  <th className="text-right px-6 py-3">Total</th>
                  <th className="text-right px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((p) => (<tr key={p.id} className="border-t border-border hover:bg-surface">
                    <td className="px-6 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-6 py-3 font-medium">{p.vendor}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-6 py-3 text-right">{p.items}</td>
                    <td className="px-6 py-3 text-right font-medium">Rs. {p.total.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${p.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => setViewing(p)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface" aria-label="View">
                        <Eye className="h-3.5 w-3.5"/>
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="font-display font-semibold mb-4">Create Purchase</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Vendor</label>
              <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background">
                <option>Auto World</option><option>Lube Center</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Part</label>
              <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background">
                {parts.slice(0, 4).map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Qty</label>
                <input defaultValue="50" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Unit cost</label>
                <input defaultValue="320" className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"/>
              </div>
            </div>
            <button className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium mt-2">Add to invoice</button>
            <button className="w-full h-10 rounded-md border border-border text-sm flex items-center justify-center gap-2"><Download className="h-4 w-4"/> Save & Print</button>
          </div>
        </div>
      </div>

      {/* New full invoice modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Purchase Invoice" description="Record a vendor invoice and update stock." size="lg" footer={<>
            <button onClick={() => setAddOpen(false)} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">Cancel</button>
            <button onClick={() => setAddOpen(false)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">Create invoice</button>
          </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vendor">
            <select className={inputCls}><option>Auto World</option><option>Lube Center</option></select>
          </Field>
          <Field label="Date"><input className={inputCls} type="date"/></Field>
          <Field label="Items count"><input className={inputCls} type="number" defaultValue={1}/></Field>
          <Field label="Total (Rs.)"><input className={inputCls} type="number" defaultValue={0}/></Field>
          <Field label="Status">
            <select className={inputCls}><option>Pending</option><option>Paid</option></select>
          </Field>
          <Field label="Reference">
            <input className={inputCls} placeholder="PO-XXXX"/>
          </Field>
        </div>
      </Modal>

      {/* View invoice */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={`Invoice ${viewing?.id ?? ""}`} description={viewing?.vendor} footer={<button onClick={() => setViewing(null)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">Close</button>}>
        {viewing && (<div className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Vendor" value={viewing.vendor}/>
            <Detail label="Date" value={viewing.date}/>
            <Detail label="Items" value={String(viewing.items)}/>
            <Detail label="Total" value={`Rs. ${viewing.total.toLocaleString()}`}/>
            <Detail label="Status" value={viewing.status}/>
          </div>)}
      </Modal>
    </div>);
}
function Detail({ label, value }) {
    return (<div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>);
}

export default PurchasesPage;
