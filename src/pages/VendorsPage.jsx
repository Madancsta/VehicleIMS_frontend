import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { vendors } from "../lib/dummy-data";
import { Plus, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
function VendorsPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [ordering, setOrdering] = useState(null);
    return (<div>
      <PageHeader title="Vendor Management" description="Suppliers and parts vendors directory." actions={<button onClick={() => setAddOpen(true)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4"/> Add Vendor
          </button>}/>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (<div key={v.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-elegant transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display font-semibold text-lg">{v.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{v.id}</div>
              </div>
              {v.outstanding > 0 && (<span className="text-xs bg-warning/20 text-warning-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  Rs. {v.outstanding.toLocaleString()} due
                </span>)}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="font-medium">{v.contact}</div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><Phone className="h-3 w-3"/> {v.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><Mail className="h-3 w-3"/> {v.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><MapPin className="h-3 w-3"/> {v.address}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setViewing(v)} className="flex-1 h-9 rounded-md border border-border text-sm hover:bg-surface">
                View
              </button>
              <button onClick={() => setOrdering(v)} className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90">
                New Order
              </button>
            </div>
          </div>))}
      </div>

      {/* Add vendor */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Vendor" description="Register a new supplier in the directory." footer={<>
            <button onClick={() => setAddOpen(false)} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">Cancel</button>
            <button onClick={() => setAddOpen(false)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Add vendor</button>
          </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vendor name"><input className={inputCls} placeholder="Auto World"/></Field>
          <Field label="Contact person"><input className={inputCls}/></Field>
          <Field label="Phone"><input className={inputCls}/></Field>
          <Field label="Email"><input className={inputCls} type="email"/></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><input className={inputCls}/></Field>
          </div>
        </div>
      </Modal>

      {/* View vendor */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? "Vendor"} description={viewing ? `Vendor ID ${viewing.id}` : undefined} footer={<button onClick={() => setViewing(null)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">Close</button>}>
        {viewing && (<div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Contact" value={viewing.contact}/>
              <Detail label="Phone" value={viewing.phone}/>
              <Detail label="Email" value={viewing.email}/>
              <Detail label="Outstanding" value={`Rs. ${viewing.outstanding.toLocaleString()}`}/>
              <div className="sm:col-span-2">
                <Detail label="Address" value={viewing.address}/>
              </div>
            </div>
          </div>)}
      </Modal>

      {/* New order */}
      <Modal open={!!ordering} onClose={() => setOrdering(null)} title={`New order — ${ordering?.name ?? ""}`} description="Create a quick purchase order." footer={<>
            <button onClick={() => setOrdering(null)} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">Cancel</button>
            <button onClick={() => setOrdering(null)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">Place order</button>
          </>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Part name"><input className={inputCls}/></Field>
          <Field label="Quantity"><input className={inputCls} type="number" defaultValue={50}/></Field>
          <Field label="Unit cost"><input className={inputCls} type="number" defaultValue={320}/></Field>
          <Field label="Expected date"><input className={inputCls} type="date"/></Field>
        </div>
      </Modal>
    </div>);
}
function Detail({ label, value }) {
    return (<div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>);
}
export default VendorsPage;
