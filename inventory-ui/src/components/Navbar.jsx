import React from 'react';

export default function Navbar({ title }) {
  return (
    <div className="top-navbar d-flex align-items-center justify-content-between px-4">
      <h5 className="mb-0 fw-semibold">{title}</h5>
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted small">Admin</span>
        <div className="avatar-circle">A</div>
      </div>
    </div>
  );
}
