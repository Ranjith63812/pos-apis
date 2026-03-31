import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, Truck, 
  Settings, MapPin, ChevronRight, ChevronDown, Circle, List, PlusSquare, ArrowLeftSquare 
} from 'lucide-react';

const SidebarGroup = ({ icon, label, children, activePaths }) => {
  const location = useLocation();
  const isActiveGroup = activePaths.some(p => location.pathname.startsWith(p));
  const [open, setOpen] = useState(isActiveGroup);

  return (
    <li className={`treeview ${open ? 'menu-open active' : ''} ${isActiveGroup && !open ? 'active' : ''}`}>
      <a href="#" onClick={(e) => { e.preventDefault(); setOpen(!open); }}>
        <div className="d-flex align-items-center">
          <span className="icon">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="pull-right-container" style={{ fontSize: '12px', color: '#8aa4af' }}>
          {open ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </span>
      </a>
      <ul className="treeview-menu" style={{ display: open ? 'block' : 'none' }}>
        {children}
      </ul>
    </li>
  );
};

export default function Sidebar() {
  return (
    <aside className="sidebar position-relative pb-5" style={{ backgroundColor: '#222d32', zIndex: 10 }}>
      {/* Brand logo area */}
      <a href="/" className="logo text-decoration-none">
        <span className="logo-lg text-white" style={{ fontSize: '18px' }}>Ultimate <b>Inventory</b></span>
      </a>

      {/* User profile block */}
      <div className="user-panel">
        <div className="image bg-danger d-flex align-items-center justify-content-center">
          <span style={{ fontSize: '20px', lineHeight: 1 }}>A</span>
        </div>
        <div className="info text-white">
          <p className="mb-1">Admin <svg width="12" height="12" viewBox="0 0 24 24" fill="#00a65a"><circle cx="12" cy="12" r="12"/></svg></p>
          <a href="#" className="text-decoration-none text-muted" style={{ fontSize: '11px' }}>
            <span className="status-indicator"></span> Online
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <ul className="sidebar-menu">
        <li className="header ps-3 py-2 text-muted fw-bold" style={{ backgroundColor: '#1a2226', fontSize: '12px' }}>NAVIGATION</li>

        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            <div className="d-flex align-items-center">
              <span className="icon"><LayoutDashboard size={16} /></span>
              <span>Dashboard</span>
            </div>
          </NavLink>
        </li>

        <SidebarGroup icon={<ShoppingCart size={16} />} label="Sales" activePaths={['/sales', '/sales-returns']}>
          <li><NavLink to="/sales/new"><PlusSquare size={12} className="icon"/> New Sales</NavLink></li>
          <li><NavLink to="/sales" end><List size={12} className="icon"/> Sales List</NavLink></li>
          <li><NavLink to="/sales-returns/new"><PlusSquare size={12} className="icon"/> New Sales Return</NavLink></li>
          <li><NavLink to="/sales-returns" end><List size={12} className="icon"/> Sales Returns List</NavLink></li>
        </SidebarGroup>

        <SidebarGroup icon={<Users size={16} />} label="Customers" activePaths={['/customers']}>
          <li><NavLink to="/customers"><PlusSquare size={12} className="icon"/> New Customer</NavLink></li>
          <li><NavLink to="/customers"><List size={12} className="icon"/> Customers List</NavLink></li>
        </SidebarGroup>

        <SidebarGroup icon={<ShoppingCart size={16} />} label="Purchase" activePaths={['/purchases', '/purchase-returns']}>
          <li><NavLink to="/purchases/new"><PlusSquare size={12} className="icon"/> New Purchase</NavLink></li>
          <li><NavLink to="/purchases" end><List size={12} className="icon"/> Purchase List</NavLink></li>
          <li><NavLink to="/purchase-returns/new"><PlusSquare size={12} className="icon"/> New Purchase Return</NavLink></li>
          <li><NavLink to="/purchase-returns" end><List size={12} className="icon"/> Purchase Returns List</NavLink></li>
        </SidebarGroup>

        <SidebarGroup icon={<Truck size={16} />} label="Suppliers" activePaths={['/suppliers']}>
          <li><NavLink to="/suppliers"><PlusSquare size={12} className="icon"/> New Supplier</NavLink></li>
          <li><NavLink to="/suppliers"><List size={12} className="icon"/> Suppliers List</NavLink></li>
        </SidebarGroup>

        <SidebarGroup icon={<Settings size={16} />} label="Items" activePaths={['/products', '/categories', '/brands', '/units']}>
          <li><NavLink to="/products"><PlusSquare size={12} className="icon"/> New Item</NavLink></li>
          <li><NavLink to="/products"><List size={12} className="icon"/> Items List</NavLink></li>
          <li><NavLink to="/categories"><PlusSquare size={12} className="icon"/> Categories</NavLink></li>
          <li><NavLink to="/brands"><PlusSquare size={12} className="icon"/> Brands</NavLink></li>
          <li><NavLink to="/units"><PlusSquare size={12} className="icon"/> Units</NavLink></li>
        </SidebarGroup>

        <SidebarGroup icon={<MapPin size={16} />} label="Places" activePaths={['/countries', '/states']}>
          <li><NavLink to="/countries"><PlusSquare size={12} className="icon"/> New Country</NavLink></li>
          <li><NavLink to="/countries"><List size={12} className="icon"/> Countries List</NavLink></li>
          <li><NavLink to="/states"><PlusSquare size={12} className="icon"/> New State</NavLink></li>
          <li><NavLink to="/states"><List size={12} className="icon"/> States List</NavLink></li>
        </SidebarGroup>
      </ul>
    </aside>
  );
}
