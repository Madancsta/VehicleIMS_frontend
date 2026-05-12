import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { 
  Plus, 
  Eye, 
  Trash, 
  Printer, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  CreditCard 
} from "lucide-react";
import { useState, useEffect } from "react";
import { purchaseService } from "../services/purchaseService";
import { vendorService } from "../services/vendorService";
import { partsService } from "../services/partsService";

function PurchasesPage() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [inv, ven, par] = await Promise.all([
        purchaseService.getAll(),
        vendorService.getAll(),
        partsService.getAll(),
      ]);
      setInvoices(inv);
      setVendors(ven);
      setParts(par);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(inv => 
    `INV-${inv.purchaseId}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading invoices...</div>;

  return (
    <div>
      {/* Header section with white background extension */}
      <div className="bg-white -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 mb-8">
        <PageHeader
          title="Purchase Invoices"
          description="Stock purchase records and vendor invoices."
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['Total Invoices', invoices.length, FileText],
          ['Total Vendors', vendors.length, Users],
          ['Items Received', invoices.reduce((sum, inv) => sum + (inv.items?.reduce((s, i) => s + i.quantity, 0) ?? 0), 0), TrendingUp],
          ['Total Spent', `Rs. ${invoices.reduce((s, inv) => s + (inv.totalAmount || 0), 0).toLocaleString()}`, CreditCard],
        ].map(([label, value, Icon]) => (
          <div key={label} className="stat-card group transition-all hover:shadow-md border border-border bg-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {label}
                </div>
                <div className="font-display text-2xl font-bold mt-2">
                  {value}
                </div>
              </div>
              <div className="pt-1">
                <Icon className="h-6 w-6 text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Box */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        
        {/* Search and Action Bar */}
        <div className="p-4 border-b border-border bg-surface/30 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by Invoice ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4">Invoice ID</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-center px-6 py-4">Quantity</th>
                <th className="text-right px-6 py-4">Total Amount</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.purchaseId} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold">INV-{inv.purchaseId}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(inv.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {inv.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    Rs. {inv.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewing(inv)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface hover:text-primary transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchAll}
        vendors={vendors}
        parts={parts}
      />

      {/* View Invoice Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Invoice INV-${viewing?.purchaseId ?? ''}`}
        description={`Date: ${viewing ? new Date(viewing.purchaseDate).toLocaleDateString() : ''}`}
        size="lg"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button
              onClick={() => window.print()}
              className="px-4 h-10 rounded-md border border-border text-sm flex items-center gap-2 hover:bg-surface"
            >
              <Printer className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={() => setViewing(null)}
              className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Close
            </button>
          </div>
        }
      >
        {viewing && (
          <div id="invoice-print">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Gearix</h2>
                <p className="text-sm text-muted-foreground">Vehicle Parts & Services</p>
                <p className="text-sm text-muted-foreground">Kathmandu, Nepal</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">PURCHASE INVOICE</div>
                <div className="text-sm text-muted-foreground">INV-{viewing.purchaseId}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(viewing.purchaseDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <hr className="my-4 border-border" />

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <Detail label="Invoice ID" value={`INV-${viewing.purchaseId}`} />
              <Detail label="Date" value={new Date(viewing.purchaseDate).toLocaleDateString()} />
              <Detail
                label="Total Units"
                value={`${viewing.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} units`}
              />
              <Detail label="Total Amount" value={`Rs. ${viewing.totalAmount?.toLocaleString()}`} />
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Items
              </div>
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Part</th>
                    <th className="text-left px-4 py-2">Vendor</th>
                    <th className="text-right px-4 py-2">Qty</th>
                    <th className="text-right px-4 py-2">Unit Price</th>
                    <th className="text-right px-4 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.items?.map((item, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2">{item.partName}</td>
                      <td className="px-4 py-2 text-muted-foreground">{item.vendorName}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">Rs. {item.unitPrice?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        Rs. {item.subTotal?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-surface">
                    <td colSpan={4} className="px-4 py-2 font-bold text-right">Total</td>
                    <td className="px-4 py-2 text-right font-bold">
                      Rs. {viewing.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateInvoiceModal({ open, onClose, onSaved, vendors, parts }) {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    vendorId: '',
    partId: '',
    quantity: '',
    unitPrice: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setItems([]);
      setCurrentItem({ vendorId: '', partId: '', quantity: '', unitPrice: '' });
    }
  }, [open]);

  const handleAddItem = () => {
    if (!currentItem.vendorId || !currentItem.partId || !currentItem.quantity || !currentItem.unitPrice)
      return alert('Please fill all item fields');

    const vendor = vendors.find(v => v.vendorId === Number(currentItem.vendorId));
    const part = parts.find(p => p.partId === Number(currentItem.partId));

    setItems([...items, {
      vendorId: Number(currentItem.vendorId),
      partId: Number(currentItem.partId),
      quantity: Number(currentItem.quantity),
      unitPrice: Number(currentItem.unitPrice),
      vendorName: vendor?.vendorName ?? '',
      partName: part?.partName ?? '',
    }]);

    setCurrentItem({ vendorId: '', partId: '', quantity: '', unitPrice: '' });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSave = async () => {
    if (items.length === 0) return alert('Please add at least one item');

    try {
      setSaving(true);
      const payload = {
        items: items.map(i => ({
          vendorId: i.vendorId,
          partId: i.partId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      };

      await purchaseService.create(payload);
      await onSaved();
      onClose();
    } catch (err) {
      alert('Failed to create invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Purchase Invoice"
      description="Add items to the invoice then save."
      size="lg"
      footer={
        <div className="flex gap-2 w-full justify-end">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : `Create Invoice (Rs. ${totalAmount.toLocaleString()})`}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-surface rounded-lg space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Add Item
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Vendor">
              <select
                className={inputCls}
                value={currentItem.vendorId}
                onChange={e => setCurrentItem({ ...currentItem, vendorId: e.target.value })}
              >
                <option value="">Select vendor</option>
                {vendors.map(v => (
                  <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                ))}
              </select>
            </Field>
            <Field label="Part">
              <select
                className={inputCls}
                value={currentItem.partId}
                onChange={e => setCurrentItem({ ...currentItem, partId: e.target.value })}
              >
                <option value="">Select part</option>
                {parts.map(p => (
                  <option key={p.partId} value={p.partId}>{p.partName}</option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input
                className={inputCls}
                type="number"
                value={currentItem.quantity}
                onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
              />
            </Field>
            <Field label="Unit Price (Rs.)">
              <input
                className={inputCls}
                type="number"
                value={currentItem.unitPrice}
                onChange={e => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
              />
            </Field>
          </div>
          <button
            onClick={handleAddItem}
            className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            + Add to Invoice
          </button>
        </div>

        {items.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Invoice Items
            </div>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Part</th>
                  <th className="text-left px-4 py-2">Vendor</th>
                  <th className="text-right px-4 py-2">Qty</th>
                  <th className="text-right px-4 py-2">Unit Price</th>
                  <th className="text-right px-4 py-2">Subtotal</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2">{item.partName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{item.vendorName}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">Rs. {item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleRemoveItem(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-surface">
                  <td colSpan={4} className="px-4 py-2 font-semibold text-right">Total</td>
                  <td className="px-4 py-2 text-right font-bold">
                    Rs. {totalAmount.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No items added yet.
          </p>
        )}
      </div>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export default PurchasesPage;