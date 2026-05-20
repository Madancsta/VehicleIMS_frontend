import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import {
  Plus,
  Edit,
  Search,
  AlertTriangle,
  Trash,
  Package,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { partsService } from "../services/partsService";
import { categoryService } from "../services/categoryService";

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
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
      alert("Failed to delete part.");
    }
  };

  const filtered = parts.filter((p) => {
    const matchSearch = p.partName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.categoryName === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="p-8 text-center">Loading parts...</div>;

  return (
    <div>
      <div className="bg-white -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 mb-8">
        <PageHeader
          title="Parts Management"
          description="Inventory of all spare parts and components."
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Total parts", parts.length, Package, false],
          ["Low stock", parts.filter((p) => p.stockQuantity < 10).length, AlertTriangle, true],
          ["Categories", categories.length, LayoutDashboard, false],
          [
            "Total value",
            `Rs. ${parts.reduce((s, p) => s + p.stockQuantity * p.partPrice, 0).toLocaleString()}`,
            BarChart3,
            false,
          ],
        ].map(([label, value, Icon, isLowStockType]) => {
          const hasAlert = isLowStockType && value > 0;
          return (
            <div
              key={label}
              className="stat-card group transition-all hover:shadow-md border border-border bg-card p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {label}
                  </div>
                  <div
                    className={`font-display text-2xl font-bold mt-2 ${hasAlert ? "text-red-600" : ""}`}
                  >
                    {value}
                  </div>
                </div>
                <div className="pt-1">
                  <Icon className={`h-6 w-6 ${hasAlert ? "text-red-600" : "text-black"}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface/30 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option>All Categories</option>
            {categories.map((c) => (
              <option key={c.partCategoryId}>{c.categoryName}</option>
            ))}
          </select>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Part
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-right px-6 py-4">Stock</th>
                <th className="text-right px-6 py-4">Price</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const low = p.stockQuantity < 10;
                return (
                  <tr key={p.partId} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.partName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.categoryName}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 ${low ? "text-red-600 font-bold" : ""}`}
                      >
                        {low && <AlertTriangle className="h-3.5 w-3.5" />}
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">
                      Rs. {p.partPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface hover:text-primary transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.partId)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                    No parts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PartFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={fetchAll}
        categories={categories}
        title="Add New Part"
      />

      <PartFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={fetchAll}
        categories={categories}
        title="Edit Part Details"
        part={editing}
      />

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Part"
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
              Delete Part
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this part? This action is permanent and cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function PartFormModal({ open, onClose, onSaved, categories, title, part }) {
  const [form, setForm] = useState({
    partName: "",
    partCategoryId: "",
    partPrice: "",
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
      setForm({ partName: "", partCategoryId: "", partPrice: "" });
    }
  }, [part, open]);

  const handleSave = async () => {
    if (!form.partName || !form.partCategoryId || !form.partPrice)
      return alert("Please fill all fields");

    try {
      setSaving(true);
      const payload = {
        partName: form.partName,
        partCategoryId: Number(form.partCategoryId),
        partPrice: Number(form.partPrice),
        stockQuantity: part ? part.stockQuantity : 0,
      };

      if (part) {
        await partsService.update(part.partId, payload);
      } else {
        await partsService.create(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      alert("Failed to save part.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Enter the details for the inventory item."
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
            {saving ? "Saving..." : part ? "Save changes" : "Add part"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <Field label="Part Name">
          <input
            className={inputCls}
            placeholder="e.g. Brake Pad"
            value={form.partName}
            onChange={(e) => setForm({ ...form, partName: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={form.partCategoryId}
            onChange={(e) => setForm({ ...form, partCategoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
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
            placeholder="0.00"
            value={form.partPrice}
            onChange={(e) => setForm({ ...form, partPrice: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

export default PartsPage;
