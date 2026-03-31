import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function DataTable({ columns, data, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted fw-medium">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted bg-white rounded shadow-sm">
        <p className="mb-0 fw-medium">No records found.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-bottom" style={{ borderRadius: 'var(--radius-md)' }}>
      <table className="table-modern">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            {columns.map((col) => (
              <th key={col.key || col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="text-muted fw-medium">{idx + 1}</td>
              {columns.map((col) => (
                <td key={col.key || col.label}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
