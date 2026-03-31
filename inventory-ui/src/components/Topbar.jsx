import React from 'react';
import { Menu, Plus, Globe, MonitorPlay, LayoutDashboard, Settings } from 'lucide-react';

export default function Topbar() {
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  };

  return (
    <header className="topbar d-flex justify-content-between align-items-center w-100" style={{ backgroundColor: '#17a2b8' }}>
      
      {/* Left side actions */}
      <div className="d-flex align-items-center h-100">
        <a href="#" className="text-white d-flex align-items-center justify-content-center h-100 px-3 hover-bg-dark-teal" style={{ textDecoration: 'none' }} title="Toggle navigation">
          <Menu size={20} />
        </a>
        <button className="btn btn-sm btn-success rounded-0 ms-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', padding: 0 }}>
          <Plus size={18} />
        </button>
      </div>

      {/* Right side navigation links */}
      <div className="navbar-custom-menu">
        <ul className="nav navbar-nav flex-row align-items-center h-100 m-0 p-0 text-white" style={{ fontSize: '13px' }}>
          
          <li className="nav-item h-100">
            <a href="#" className="nav-link text-white d-flex align-items-center gap-1 h-100 px-3 hover-bg-dark-teal">
              <Globe size={14} /> English
            </a>
          </li>
          
          <li className="nav-item h-100">
            <a href="/sales/new" className="nav-link text-white d-flex align-items-center gap-1 h-100 px-3 hover-bg-dark-teal">
              <MonitorPlay size={14} /> POS
            </a>
          </li>
          
          <li className="nav-item h-100">
            <a href="/" className="nav-link text-white d-flex align-items-center gap-1 h-100 px-3 hover-bg-dark-teal">
              <LayoutDashboard size={14} /> Dashboard
            </a>
          </li>
          
          <li className="nav-item h-100 dropdown">
            <a href="#" className="nav-link text-white d-flex align-items-center gap-2 h-100 px-3 hover-bg-dark-teal dropdown-toggle border-0" data-bs-toggle="dropdown">
              <div className="rounded-circle bg-danger d-flex justify-content-center align-items-center" style={{ width: '22px', height: '22px' }}>
                <span className="fw-bolder" style={{ fontSize: '10px' }}>A</span>
              </div>
              <span>Admin</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end rounded-0 shadow-sm border-0 mt-0">
               <li><a className="dropdown-item py-2" href="#" onClick={handleLogout}>Sign out</a></li>
            </ul>
          </li>
          
          <li className="nav-item h-100 text-end pe-3 ps-2 d-flex align-items-center">
             <Settings size={16} className="text-white" style={{ cursor: 'pointer' }} onClick={handleLogout} title="Logout" />
          </li>

        </ul>
      </div>
      
    </header>
  );
}
