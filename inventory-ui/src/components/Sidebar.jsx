import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

// ── Top-level nav items ────────────────────────────────────────────────────────
const topItems = [
  { path: '/',          label: 'Dashboard',  icon: '🏠' },
  { path: '/products',  label: 'Products',   icon: '📦' },
  { path: '/categories',label: 'Categories', icon: '🗂️' },
  { path: '/customers', label: 'Customers',  icon: '👥' },
  { path: '/suppliers', label: 'Suppliers',  icon: '🏭' },
  { path: '/purchases', label: 'Purchases',  icon: '🛒' },
  { path: '/sales',     label: 'Sales',      icon: '💰' },
  { path: '/expenses',  label: 'Expenses',   icon: '💸' },
];

// ── Places sub-menu items ──────────────────────────────────────────────────────
const placesItems = [
  { path: '/countries', label: 'Countries', icon: '🌍' },
  { path: '/states',    label: 'States',    icon: '🗺️' },
];

export default function Sidebar() {

  // Track whether the Places group is expanded
  const [placesOpen, setPlacesOpen] = useState(false);

  return (
    <div className="sidebar d-flex flex-column">

      {/* ── Brand ── */}
      <div className="sidebar-brand">📊 POS System</div>

      <nav className="sidebar-nav flex-grow-1">

        {/* ── Top-level links ── */}
        {topItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* ── Places collapsible group ── */}
        <div
          className="sidebar-group-header"
          onClick={() => setPlacesOpen(prev => !prev)}
        >
          <span className="sidebar-icon">📍</span>
          <span>Places</span>
          <span className="ms-auto">{placesOpen ? '▾' : '▸'}</span>
        </div>

        {/* Sub-links shown only when placesOpen = true */}
        {placesOpen && (
          <div className="sidebar-submenu">
            {placesItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link sidebar-sublink ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">v1.0.0</div>
    </div>
  );
}

