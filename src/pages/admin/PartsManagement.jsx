// src/pages/admin/PartsManagement.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const INITIAL_PARTS = [
  { 
    id: 1, name: 'Brake Pad Set', category: 'Brakes', price: 2500, stock: 34, sku: 'BRK-001',
    description: 'High-performance ceramic brake pads.', 
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=100' 
  },
  { 
    id: 2, name: 'Oil Filter', category: 'Engine', price: 450, stock: 8, sku: 'ENG-012',
    description: 'Premium filtration for engine longevity.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=100'
  },
];

const CATEGORIES = ['All', 'Brakes', 'Engine', 'Ignition', 'Exterior', 'Suspension'];

// Updated emptyForm with image and description
const emptyForm = { name: '', category: 'Engine', price: '', stock: '', sku: '', description: '', image: '' };

const Badge = ({ stock }) => {
  const low = stock < 10;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      background: low ? '#fee2e2' : '#dcfce7',
      color: low ? '#dc2626' : '#16a34a',
    }}>{stock} {low ? '⚠ Low' : 'In Stock'}</span>
  );
};

export default function PartsManagement() {
  const [parts, setParts] = useState(INITIAL_PARTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = parts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setForm(emptyForm); setEditingPart(null); setShowModal(true); };
  const openEdit = (part) => { setForm({ ...part }); setEditingPart(part.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.price || !form.stock || !form.sku) return alert('Please fill required fields');
    if (editingPart) {
      setParts(parts.map(p => p.id === editingPart ? { ...form, id: editingPart, price: Number(form.price), stock: Number(form.stock) } : p));
    } else {
      setParts([...parts, { ...form, id: Date.now(), price: Number(form.price), stock: Number(form.stock) }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => { setParts(parts.filter(p => p.id !== id)); setDeleteConfirm(null); };

  const card = { background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #ECEBE4' };

  return (
    <AdminLayout title="Parts Management" activePage="/admin/parts">
      
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Parts', value: parts.length, icon: '⚙' },
          { label: 'Low Stock', value: parts.filter(p => p.stock < 10).length, icon: '⚠', alert: true },
          { label: 'Categories', value: CATEGORIES.length - 1, icon: '📂' },
        ].map(stat => (
          <div key={stat.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: stat.alert ? '#fee2e2' : '#EEF0F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>{stat.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1C1C1C' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              placeholder="Search parts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '9px 14px', borderRadius: '8px', border: '1px solid #ECEBE4',
                background: '#FAFAFF', fontSize: '14px', width: '220px', outline: 'none',
              }}
            />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{
              padding: '9px 14px', borderRadius: '8px', border: '1px solid #ECEBE4',
              background: '#FAFAFF', fontSize: '14px', outline: 'none', cursor: 'pointer',
            }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={openAdd} style={{
            background: '#1C1C1C', color: '#FAFAFF', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>+ Add New Part</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ECEBE4' }}>
                {['Preview', 'SKU', 'Part Name', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#9ca3af', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((part, i) => (
                <tr key={part.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#FAFAFF' }}>
                  <td style={{ padding: '13px 12px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', background: '#f1f1f1', border: '1px solid #eee' }}>
                      {part.image ? <img src={part.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '10px', textAlign: 'center', paddingTop: '14px' }}>No Img</div>}
                    </div>
                  </td>
                  <td style={{ padding: '13px 12px', color: '#9ca3af', fontFamily: 'monospace' }}>{part.sku}</td>
                  <td style={{ padding: '13px 12px' }}>
                    <div style={{ fontWeight: 700, color: '#1C1C1C' }}>{part.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{part.description || 'No description'}</div>
                  </td>
                  <td style={{ padding: '13px 12px', fontWeight: 600 }}>Rs. {part.price.toLocaleString()}</td>
                  <td style={{ padding: '13px 12px' }}><Badge stock={part.stock} /></td>
                  <td style={{ padding: '13px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(part)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #ECEBE4', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(part.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fee2e2', color: '#dc2626', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700 }}>{editingPart ? 'Update Part' : 'Add New Part'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} style={inputStyle} />
               </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
               <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Image URL</label>
               <input value={form.image} placeholder="Paste image link here..." onChange={e => setForm({...form, image: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
               <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Description</label>
               <textarea value={form.description} rows="3" onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, resize: 'none'}} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
               <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Price (NPR)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inputStyle} />
               </div>
               <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #ECEBE4', background: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#1C1C1C', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Part</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation logic stays the same as your code */}
    </AdminLayout>
  );
}

const inputStyle = {
  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ECEBE4', outline: 'none', background: '#FAFAFF', fontSize: '14px', boxSizing: 'border-box'
};