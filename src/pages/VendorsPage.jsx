import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { Plus, Phone, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { vendorService } from "../services/vendorService";

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="p-8 text-center">Loading vendors...</div>;

  return (
    <div>
      <PageHeader
        title="Vendor Management"
        description="Suppliers and parts vendors directory."
        actions={
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div key={v.vendorId} className="bg-card border border-border rounded-lg p-5 hover:shadow-elegant transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display font-semibold text-lg">{v.vendorName}</div>
                <div className="text-xs text-muted-foreground font-mono">ID: {v.vendorId}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Phone className="h-3 w-3" /> {v.vendorPhone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="h-3 w-3" /> {v.vendorEmail}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <MapPin className="h-3 w-3" /> {v.vendorAddress}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setViewing(v)}
                className="flex-1 h-9 rounded-md border border-border text-sm hover:bg-surface"
              >
                View
              </button>
              <button
                onClick={() => setEditing(v)}
                className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(v.vendorId)}
                className="h-9 px-3 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {vendors.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No vendors yet. Add your first vendor!
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      <VendorFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchVendors}
        title="Add Vendor"
      />

      {/* Edit Vendor Modal */}
      <VendorFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={fetchVendors}
        title="Edit Vendor"
        vendor={editing}
      />

      {/* View Vendor Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.vendorName ?? "Vendor"}
        footer={
          <button
            onClick={() => setViewing(null)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Vendor Name" value={viewing.vendorName} />
            <Detail label="Email" value={viewing.vendorEmail} />
            <Detail label="Phone" value={String(viewing.vendorPhone)} />
            <Detail label="Address" value={viewing.vendorAddress} />
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Vendor?"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 h-10 rounded-md border border-border text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-4 h-10 rounded-md bg-red-600 text-white text-sm font-medium"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
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
        vendorName: vendor.vendorName,
        vendorEmail: vendor.vendorEmail,
        vendorPhone: String(vendor.vendorPhone),
        vendorAddress: vendor.vendorAddress,
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
      description="Fill in the vendor details below."
      footer={
        <>
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
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vendor Name">
          <input
            className={inputCls}
            value={form.vendorName}
            onChange={e => setForm({ ...form, vendorName: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputCls}
            type="email"
            value={form.vendorEmail}
            onChange={e => setForm({ ...form, vendorEmail: e.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            type="number"
            value={form.vendorPhone}
            onChange={e => setForm({ ...form, vendorPhone: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address">
            <input
              className={inputCls}
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
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export default VendorsPage;