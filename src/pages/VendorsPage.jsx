import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Eye,
  Phone,
  Mail
} from "lucide-react";
import { useState, useEffect } from "react";
import { vendorService } from "../services/vendorService";

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await vendorService.delete(id);
      await fetchVendors();
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete vendor.');
    }
  };

  const filtered = vendors.filter(v => 
    v.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
    v.vendorEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading vendors...</div>;

  return (
    <div>
      {/* Header section - Matches Parts Page */}
      <div className="bg-white -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 mb-8">
        <PageHeader
          title="Vendor Management"
          description="Suppliers and parts vendors directory."
        />
      </div>

      {/* Main Content Box — Matches Parts Page Border & Shadow */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        
        {/* Search Bar & Action — Matches Parts Page Layout */}
        <div className="p-4 border-b border-border bg-surface/30 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        </div>

        {/* Table Content — Matches Parts Page Fonts and Spacing */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4">Vendor Name</th>
                <th className="text-left px-6 py-4">Contact Info</th>
                <th className="text-left px-6 py-4">Address</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.vendorId} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {v.vendorName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Mail className="h-3 w-3" /> {v.vendorEmail}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Phone className="h-3 w-3" /> {v.vendorPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                    {v.vendorAddress}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => setViewing(v)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface hover:text-primary transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditing(v)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface hover:text-primary transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(v.vendorId)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <VendorFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchVendors}
        title="Add New Vendor"
      />

      {/* Edit Modal */}
      <VendorFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={fetchVendors}
        title="Edit Vendor Details"
        vendor={editing}
      />

      {/* View Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.vendorName ?? "Vendor Details"}
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setViewing(null)}
              className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Close
            </button>
          </div>
        }
      >
        {viewing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <Detail label="Vendor Name" value={viewing.vendorName} />
            <Detail label="Email Address" value={viewing.vendorEmail} />
            <Detail label="Phone Number" value={String(viewing.vendorPhone)} />
            <Detail label="Full Address" value={viewing.vendorAddress} />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Vendor"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-4 h-10 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Delete Vendor
            </button>
          </div>
        }
      >
        <p className="text-m text-center text-muted-foreground">
          Are you sure you want to delete this vendor? 
        </p>
      </Modal>
    </div>
  );
}

function VendorFormModal({ open, onClose, onSaved, title, vendor }) {
  const [form, setForm] = useState({
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setForm({
        vendorName: vendor.vendorName || '',
        vendorEmail: vendor.vendorEmail || '',
        vendorPhone: String(vendor.vendorPhone || ''),
        vendorAddress: vendor.vendorAddress || '',
      });
    } else {
      setForm({ vendorName: '', vendorEmail: '', vendorPhone: '', vendorAddress: '' });
    }
  }, [vendor, open]);

  const handleSave = async () => {
    if (!form.vendorName || !form.vendorEmail || !form.vendorPhone || !form.vendorAddress)
      return alert('Please fill all fields');

    try {
      setSaving(true);
      const payload = {
        vendorName: form.vendorName,
        vendorEmail: form.vendorEmail,
        vendorPhone: Number(form.vendorPhone),
        vendorAddress: form.vendorAddress,
      };

      if (vendor) {
        await vendorService.update(vendor.vendorId, payload);
      } else {
        await vendorService.create(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      alert('Failed to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Enter the details for the supplier or vendor."
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
            disabled={saving}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            {saving ? 'Saving...' : vendor ? 'Save changes' : 'Add vendor'}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <Field label="Vendor Name">
          <input
            className={inputCls}
            placeholder="e.g. Nepal Auto Parts"
            value={form.vendorName}
            onChange={e => setForm({ ...form, vendorName: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputCls}
            type="email"
            placeholder="vendor@example.com"
            value={form.vendorEmail}
            onChange={e => setForm({ ...form, vendorEmail: e.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            type="number"
            placeholder="98XXXXXXXX"
            value={form.vendorPhone}
            onChange={e => setForm({ ...form, vendorPhone: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address">
            <input
              className={inputCls}
              placeholder="Full location address"
              value={form.vendorAddress}
              onChange={e => setForm({ ...form, vendorAddress: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="mt-1.5 font-medium text-foreground">{value}</div>
    </div>
  );
}

export default VendorsPage;