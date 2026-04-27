// src/components/AdminLayout.jsx
import React, { useState } from 'react';

const NAV = [
  {
    items: [
      {
        label: 'Parts Management',
        href: '/admin/parts',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        ),
      },
      {
        label: 'Purchase Invoices',
        href: '/admin/purchases',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        ),
      },
      {
        label: 'Vendors',
        href: '/admin/vendors',
        icon: (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
      },
    ],
  },
];

const Sidebar = ({ activePage }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? '76px' : '300px',
      minHeight: '100vh',
      background: '#1C1C1C',
      color: '#FAFAFF',
      padding: '28px 14px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.22s ease',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '32px', paddingLeft: '6px', whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
          background: '#DADDD8', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#1C1C1C', fontWeight: 800, fontSize: '14px',
        }}>VP</div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px' }}>VehicleIMS</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px', marginLeft: '4px', marginRight: '4px' }} />

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '4px' }}>
            {group.items.map(item => {
              const isActive = activePage === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '15px 14px', borderRadius: '9px', marginBottom: '8px',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    background: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
                    color: isActive ? '#FAFAFF' : 'rgba(255,255,255,0.5)',
                    fontSize: '15.5px', fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }
                    e.currentTarget.style.color = '#FAFAFF';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    }
                  }}
                >
                  <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                  {!collapsed && item.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Divider above logout */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px', marginLeft: '4px', marginRight: '4px' }} />

      {/* Logout */}
      <div
        title={collapsed ? 'Log Out' : ''}
        style={{
          color: 'rgba(255,255,255,0.5)', padding: '10px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '12px', fontSize: '15.5px', transition: 'all 0.15s',
          whiteSpace: 'nowrap', borderRadius: '9px',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {!collapsed && 'Log Out'}
      </div>
    </aside>
  );
};

const AdminLayout = ({ children, title, activePage }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EEF0F2', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Sidebar activePage={activePage} />
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #ECEBE4',
          padding: '0 32px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Admin Panel</p>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1C1C1C', letterSpacing: '-0.3px' }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: '#DADDD8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280',
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: '#1C1C1C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FAFAFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}>A</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;