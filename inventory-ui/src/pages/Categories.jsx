import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';

const emptyForm = { category_name: '', category_code: '', description: '', status: 1 };

export default function Categories() {
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
    try { const res = await getCategories(); setData(res.data || []); } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (row) => {
    setForm({ category_name: row.category_name, category_code: row.category_code || '',
      description: row.description || '', status: row.status ?? 1 });
    setEditId(row.category_id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_name) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      if (editId) await updateCategory(editId, form);
      else await createCategory(form);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteCategory(deleteTarget.category_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'category_name', label: 'Name' },
    { key: 'category_code', label: 'Code' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status', render: (r) => r.status === 1 ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span> },
  ];

  return (
    <div className="page-content">
      <Navbar title="Categories" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
        </div>
        {showForm && (
          <div className="card card-form mb-4"><div className="card-body">
            <h6 className="mb-3">{editId ? 'Edit Category' : 'Add Category'}</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Category Name *</label>
                <input className="form-control" value={form.category_name} onChange={e => setForm({ ...form, category_name: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Code</label>
                <input className="form-control" value={form.category_code} onChange={e => setForm({ ...form, category_code: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Description</label>
                <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: parseInt(e.target.value) })}>
                  <option value={1}>Active</option><option value={0}>Inactive</option>
                </select>
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
      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.category_name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
