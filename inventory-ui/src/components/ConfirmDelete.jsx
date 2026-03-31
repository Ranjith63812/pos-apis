import React, { useState } from 'react';

export default function ConfirmDelete({ show, item, itemName, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-content p-4 rounded-3 shadow">
          <h5 className="mb-2">🗑️ Confirm Delete</h5>
          <p className="text-muted mb-4">
            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
          </p>
          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
