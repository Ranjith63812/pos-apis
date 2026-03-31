import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customerApi';

const emptyForm = { customer_name: '', mobile: '', email: '', city: '', address: '', status: 1 };

export default function Customers() {
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
    try { const res = await getCustomers(); setData(res.data || []); } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (row) => {
    setForm({ customer_name: row.customer_name, mobile: row.mobile || '', email: row.email || '',
      city: row.city || '', address: row.address || '', status: row.status ?? 1 });
    setEditId(row.customer_id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name) { setError('Customer name is required.'); return; }
    setSaving(true);
    try {
      if (editId) await updateCustomer(editId, form);
      else await createCustomer(form);
      setShowForm(false); load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save.';
      setError(msg);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCustomer(deleteTarget.customer_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'customer_name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status', render: (r) => r.status === 1 ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span> },
  ];

  return (
    <div className="page-content">
      <Navbar title="Customers" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Customer</button>
        </div>
        {showForm && (
          <div className="card card-form mb-4"><div className="card-body">
            <h6 className="mb-3">{editId ? 'Edit Customer' : 'Add Customer'}</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4"><label className="form-label">Name *</label>
                <input className="form-control" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
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
      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.customer_name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
