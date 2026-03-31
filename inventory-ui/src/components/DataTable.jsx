import React from 'react';

export default function DataTable({ columns, data, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>No records found.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="text-muted">{idx + 1}</td>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEdit(row)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(row)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
