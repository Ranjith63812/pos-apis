import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplierApi';

const emptyForm = { supplier_name: '', mobile: '', email: '', city: '', address: '', status: 1 };

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await getSuppliers(); setData(res.data || []); } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (row) => {
    setForm({ supplier_name: row.supplier_name, mobile: row.mobile || '', email: row.email || '',
      city: row.city || '', address: row.address || '', status: row.status ?? 1 });
    setEditId(row.supplier_id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_name) { setError('Supplier name is required.'); return; }
    setSaving(true);
    try {
      if (editId) await updateSupplier(editId, form);
      else await createSupplier(form);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteSupplier(deleteTarget.supplier_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'supplier_name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status', render: (r) => r.status === 1 ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span> },
  ];

  return (
    <div className="page-content">
      <Navbar title="Suppliers" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Supplier</button>
        </div>
        {showForm && (
          <div className="card card-form mb-4"><div className="card-body">
            <h6 className="mb-3">{editId ? 'Edit Supplier' : 'Add Supplier'}</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4"><label className="form-label">Name *</label>
                <input className="form-control" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} required />
              </div>
              <div className="col-md-4"><label className="form-label">Mobile</label>
                <input className="form-control" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div className="col-md-4"><label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-4"><label className="form-label">City</label>
                <input className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="col-md-8"><label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div></div>
        )}
        <div className="card"><div className="card-body p-0">
          <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div></div>
      </div>
      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.supplier_name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
