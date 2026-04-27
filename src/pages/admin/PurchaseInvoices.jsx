// src/pages/admin/PurchaseInvoices.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const VENDORS = ['AutoParts Nepal', 'Himalayan Motors', 'KTM Spares Co.', 'Valley Auto Supply'];

// In a real app, these would come from your PartsManagement state or a Database
const PARTS = [
  { id: 1, name: 'Brake Pad Set', price: 1800, sku: 'BRK-001' }, // Note: Unit Price is usually lower than Selling Price
  { id: 2, name: 'Oil Filter', price: 300, sku: 'ENG-012' },
  { id: 3, name: 'Air Filter', price: 400, sku: 'ENG-013' },
  { id: 4, name: 'Spark Plug', price: 200, sku: 'IGN-004' },
];

const INITIAL_INVOICES = [
  { id: 'PI-001', vendor: 'AutoParts Nepal', date: '2026-04-20', total: 45000, status: 'Received', items: 3 },
  { id: 'PI-002', vendor: 'Himalayan Motors', date: '2026-04-18', total: 28500, status: 'Pending', items: 2 },
];

const StatusBadge = ({ status }) => (
  <span style={{
    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    background: status === 'Received' ? '#dcfce7' : '#fef9c3',
    color: status === 'Received' ? '#16a34a' : '#a16207',
  }}>{status}</span>
);

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [showCreate, setShowCreate] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);

  // Form state
  const [vendor, setVendor] = useState(VENDORS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState([{ partId: 1, quantity: 1, unitPrice: 1800 }]);

  const addLine = () => setLineItems([...lineItems, { partId: 1, quantity: 1, unitPrice: PARTS[0].price }]);
  const removeLine = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) => {
    const updated = [...lineItems];
    updated[i][field] = field === 'partId' ? Number(value) : Number(value);
    if (field === 'partId') {
      const part = PARTS.find(p => p.id === Number(value));
      updated[i].unitPrice = part?.price || 0;
    }
    setLineItems(updated);
  };

  const totalAmount = lineItems.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const handleCreate = () => {
    const newInvoice = {
      id: `PI-${String(invoices.length + 1).padStart(3, '0')}`,
      vendor, date, total: totalAmount, status: 'Pending', items: lineItems.length,
    };
    setInvoices([newInvoice, ...invoices]);
    setShowCreate(false);
    setLineItems([{ partId: 1, quantity: 1, unitPrice: 1800 }]);
  };

  const markAsReceived = (id) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Received' } : inv));
    setViewInvoice(null);
  };

  const card = { background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #ECEBE4' };

  return (
    <AdminLayout title="Purchase Invoices" activePage="/admin/purchases">

      {/* Analytics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Pending Orders', value: invoices.filter(i => i.status === 'Pending').length, color: '#a16207' },
          { label: 'Total Procurement', value: `Rs. ${invoices.reduce((s, i) => s + i.total, 0).toLocaleString()}`, color: '#1C1C1C' },
          { label: 'Vendors Active', value: VENDORS.length, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 800, color: '#1C1C1C' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Invoice History</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Manage stock arrivals and vendor payments</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            background: '#1C1C1C', color: '#FAFAFF', border: 'none',
            padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>+ Create Invoice</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ECEBE4' }}>
              {['Invoice', 'Vendor & Date', 'Size', 'Total Amount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ padding: '16px 12px', fontWeight: 700, fontFamily: 'monospace' }}>{inv.id}</td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{inv.vendor}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{inv.date}</div>
                </td>
                <td style={{ padding: '16px 12px', fontSize: '13px' }}>{inv.items} Items</td>
                <td style={{ padding: '16px 12px', fontWeight: 700 }}>Rs. {inv.total.toLocaleString()}</td>
                <td style={{ padding: '16px 12px' }}><StatusBadge status={inv.status} /></td>
                <td style={{ padding: '16px 12px' }}>
                  <button onClick={() => setViewInvoice(inv)} style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #ECEBE4',
                    background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                  }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Invoice */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,28,28,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 800 }}>New Purchase Order</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Select Vendor</label>
                <select value={vendor} onChange={e => setVendor(e.target.value)} style={inputStyle}>
                  {VENDORS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Order Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={labelStyle}>Line Items</label>
                <button onClick={addLine} style={{ background: 'none', border: 'none', color: '#1C1C1C', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ Add Row</button>
              </div>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {lineItems.map((line, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                    <select value={line.partId} onChange={e => updateLine(i, 'partId', e.target.value)} style={inputStyle}>
                      {PARTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} style={inputStyle} placeholder="Qty" />
                    <div style={{ ...inputStyle, background: '#f3f4f6', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                      Rs. {(line.quantity * line.unitPrice).toLocaleString()}
                    </div>
                    <button onClick={() => removeLine(i)} style={{ border: 'none', background: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '18px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#1C1C1C', borderRadius: '12px', padding: '20px', marginBottom: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>Total Purchase Value</span>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>Rs. {totalAmount.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #ECEBE4', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '12px 24px', borderRadius: '10px', background: '#1C1C1C', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Details */}
      {viewInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>📄</div>
              <h3 style={{ margin: 0 }}>Invoice {viewInvoice.id}</h3>
              <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '14px' }}>{viewInvoice.vendor}</p>
            </div>

            <div style={{ borderTop: '1px dashed #ECEBE4', borderBottom: '1px dashed #ECEBE4', padding: '20px 0', marginBottom: '24px' }}>
              <div style={detailRow}><span>Date</span> <b>{viewInvoice.date}</b></div>
              <div style={detailRow}><span>Total Items</span> <b>{viewInvoice.items}</b></div>
              <div style={detailRow}><span>Total Price</span> <b>Rs. {viewInvoice.total.toLocaleString()}</b></div>
              <div style={detailRow}><span>Current Status</span> <StatusBadge status={viewInvoice.status} /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {viewInvoice.status === 'Pending' && (
                <button onClick={() => markAsReceived(viewInvoice.id)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#16a34a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Mark as Received
                </button>
              )}
              <button onClick={() => setViewInvoice(null)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ECEBE4', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ECEBE4', fontSize: '14px', outline: 'none', background: '#FAFAFF', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px'
};

const detailRow = {
  display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'
};