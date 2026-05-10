import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { Plus, Edit, Search, AlertTriangle, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { partsService } from "../services/partsService";
import { categoryService } from "../services/categoryService";

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [partsData, catsData] = await Promise.all([
        partsService.getAll(),
        categoryService.getAll(),
      ]);
      setParts(partsData);
      setCategories(catsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await partsService.delete(id);
      await fetchAll();
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete part.');
    }
  };

  const filtered = parts.filter(p => {
    const matchSearch = p.partName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.categoryName === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="p-8 text-center">Loading parts...</div>;

  return (
    <div>
      <PageHeader
        title="Parts Management"
        description="Inventory of all spare parts and components."
        actions={
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Part
          </button>
        }
      />

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-card"
        >
          <option>All</option>
          {categories.map(c => (
            <option key={c.partCategoryId}>{c.categoryName}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ['Total parts', parts.length],
          ['Low stock', parts.filter(p => p.stockQuantity < 10).length],
          ['Categories', categories.length],
          ['Total value', `Rs. ${parts.reduce((s, p) => s + p.stockQuantity * p.partPrice, 0).toLocaleString()}`],
        ].map(([l, v]) => (
          <div key={l} className="stat-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="font-display text-2xl font-bold mt-2">{v}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Category</th>
                <th className="text-right px-6 py-3">Stock</th>
                <th className="text-right px-6 py-3">Price</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const low = p.stockQuantity < 10;
                return (
                  <tr key={p.partId} className="border-t border-border hover:bg-surface">
                    <td className="px-6 py-3 font-medium">{p.partName}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.categoryName}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 ${low ? 'text-destructive font-medium' : ''}`}>
                        {low && <AlertTriangle className="h-3 w-3" />}
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono">
                      Rs. {p.partPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.partId)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface text-red-500"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    No parts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <PartFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchAll}
        categories={categories}
        title="Add Part"
      />

      {/* Edit Modal */}
      <PartFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={fetchAll}
        categories={categories}
        title="Edit Part"
        part={editing}
      />

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Part?"
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

function PartFormModal({ open, onClose, onSaved, categories, title, part }) {
  const [form, setForm] = useState({
    partName: '',
    partCategoryId: '',
    partPrice: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (part) {
      setForm({
        partName: part.partName,
        partCategoryId: String(part.partCategoryId),
        partPrice: String(part.partPrice),
      });
    } else {
      setForm({ partName: '', partCategoryId: '', partPrice: '' });
    }
  }, [part, open]);

  const handleSave = async () => {
    if (!form.partName || !form.partCategoryId || !form.partPrice)
      return alert('Please fill all fields');

    try {
      setSaving(true);
      const payload = {
        partName: form.partName,
        partCategoryId: Number(form.partCategoryId),
        partPrice: Number(form.partPrice),
        stockQuantity: 0, // always 0 when creating, increases via purchase
      };

      if (part) {
        await partsService.update(part.partId, payload);
      } else {
        await partsService.create(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      alert('Failed to save part.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Fill in the part details below."
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
            {saving ? 'Saving...' : part ? 'Save changes' : 'Add part'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Part Name">
          <input
            className={inputCls}
            value={form.partName}
            onChange={e => setForm({ ...form, partName: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={form.partCategoryId}
            onChange={e => setForm({ ...form, partCategoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.partCategoryId} value={c.partCategoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price (Rs.)">
          <input
            className={inputCls}
            type="number"
            value={form.partPrice}
            onChange={e => setForm({ ...form, partPrice: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

export default PartsPage;