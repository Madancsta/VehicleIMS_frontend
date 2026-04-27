// src/pages/admin/Vendors.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const INITIAL_VENDORS = [
  { id: 1, name: 'AutoParts Nepal', email: 'contact@autopartsnepal.com', phone: '9801234567', address: 'New Road, Kathmandu', parts: 24 },
  { id: 2, name: 'Himalayan Motors', email: 'info@himalayanmotors.com', phone: '9807654321', address: 'Pulchowk, Lalitpur', parts: 15 },
  { id: 3, name: 'KTM Spares Co.', email: 'sales@ktmspares.com', phone: '9841122334', address: 'Chabahil, Kathmandu', parts: 9 },
  { id: 4, name: 'Valley Auto Supply', email: 'hello@valleyauto.com', phone: '9812233445', address: 'Bhaktapur Durbar Sq.', parts: 31 },
];

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Vendors() {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewVendor, setViewVendor] = useState(null);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (v) => { setForm({ name: v.name, email: v.email, phone: v.phone, address: v.address }); setEditingId(v.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.email || !form.phone || !form.address) return alert('Please fill all fields');
    if (editingId) {
      setVendors(vendors.map(v => v.id === editingId ? { ...v, ...form } : v));
    } else {
      setVendors([...vendors, { ...form, id: Date.now(), parts: 0 }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => { setVendors(vendors.filter(v => v.id !== id)); setDeleteConfirm(null); };

  const card = { background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #ECEBE4' };

  const avatar = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#DADDD8', '#EEF0F2', '#ECEBE4', '#d1fae5'];

  return (
    <AdminLayout title="Vendors" activePage="/admin/vendors">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Vendors', value: vendors.length },
          { label: 'Total Parts Supplied', value: vendors.reduce((s, v) => s + v.parts, 0) },
          { label: 'Avg Parts / Vendor', value: Math.round(vendors.reduce((s, v) => s + v.parts, 0) / vendors.length) },
        ].map(s => (
          <div key={s.label} style={card}>
            <p style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1C1C1C' }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <input
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '8px', border: '1px solid #ECEBE4',
              background: '#FAFAFF', fontSize: '14px', width: '220px', outline: 'none',
            }}
          />
          <button onClick={openAdd} style={{
            background: '#1C1C1C', color: '#FAFAFF', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>+ Add Vendor</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map((v, i) => (
            <div key={v.id} style={{
              border: '1px solid #ECEBE4', borderRadius: '12px', padding: '20px',
              background: '#FAFAFF', transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Avatar + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: colors[i % colors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', color: '#1C1C1C', flexShrink: 0,
                }}>{avatar(v.name)}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#1C1C1C' }}>{v.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{v.parts} parts supplied</p>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8', marginBottom: '16px' }}>
                <div>📧 {v.email}</div>
                <div>📞 {v.phone}</div>
                <div>📍 {v.address}</div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setViewVendor(v)} style={{
                  flex: 1, padding: '7px', borderRadius: '7px', border: '1px solid #ECEBE4',
                  background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500,
                }}>View</button>
                <button onClick={() => openEdit(v)} style={{
                  flex: 1, padding: '7px', borderRadius: '7px', border: '1px solid #ECEBE4',
                  background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500,
                }}>Edit</button>
                <button onClick={() => setDeleteConfirm(v.id)} style={{
                  flex: 1, padding: '7px', borderRadius: '7px', border: '1px solid #fee2e2',
                  background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500, color: '#dc2626',
                }}>Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No vendors found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '440px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700 }}>
              {editingId ? 'Edit Vendor' : 'Add New Vendor'}
            </h3>
            {[
              { label: 'Vendor Name', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Phone Number', key: 'phone' },
              { label: 'Address', key: 'address' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>{field.label}</label>
                <input
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ECEBE4', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', background: '#FAFAFF',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #ECEBE4', background: '#fff', fontSize: '14px', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1C1C1C', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>{editingId ? 'Save Changes' : 'Add Vendor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Vendor Modal */}
      {viewVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '14px', background: '#EEF0F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '18px', margin: '0 auto 12px',
              }}>{avatar(viewVendor.name)}</div>
              <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '18px' }}>{viewVendor.name}</h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>{viewVendor.parts} parts supplied</p>
            </div>
            {[['Email', viewVendor.email], ['Phone', viewVendor.phone], ['Address', viewVendor.address]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>{k}</span>
                <span style={{ fontWeight: 500, fontSize: '14px', maxWidth: '220px', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <button onClick={() => setViewVendor(null)} style={{
              width: '100%', marginTop: '20px', padding: '11px', borderRadius: '8px',
              border: '1px solid #ECEBE4', background: '#fff', fontSize: '14px', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑</div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>Delete Vendor?</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                padding: '10px 24px', borderRadius: '8px', border: '1px solid #ECEBE4', background: '#fff', fontSize: '14px', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}