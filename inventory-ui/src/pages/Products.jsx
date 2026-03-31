import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';

const emptyForm = {
  item_name: '', item_code: '', price: '', purchase_price: '',
  sales_price: '', status: 1,
};

export default function Products() {
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
    try {
      const res = await getProducts();
      setData(res.data || []);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (row) => {
    setForm({ item_name: row.item_name, item_code: row.item_code || '', price: row.price || '',
      purchase_price: row.purchase_price || '', sales_price: row.sales_price || '', status: row.status ?? 1 });
    setEditId(row.product_id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name) { setError('Product name is required.'); return; }
    setSaving(true);
    try {
      if (editId) await updateProduct(editId, form);
      else await createProduct(form);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteProduct(deleteTarget.product_id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: 'item_name', label: 'Name' },
    { key: 'item_code', label: 'Code' },
    { key: 'price', label: 'Price', render: (r) => `₹${r.price ?? 0}` },
    { key: 'sales_price', label: 'Sales Price', render: (r) => `₹${r.sales_price ?? 0}` },
    { key: 'current_stock', label: 'Stock' },
    { key: 'status', label: 'Status', render: (r) => r.status === 1 ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span> },
  ];

  return (
    <div className="page-content">
      <Navbar title="Products" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>

        {showForm && (
          <div className="card card-form mb-4">
            <div className="card-body">
              <h6 className="mb-3">{editId ? 'Edit Product' : 'Add Product'}</h6>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Product Name *</label>
                  <input className="form-control" value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Item Code</label>
                  <input className="form-control" value={form.item_code} onChange={e => setForm({ ...form, item_code: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price</label>
                  <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Purchase Price</label>
                  <input className="form-control" type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sales Price</label>
                  <input className="form-control" type="number" value={form.sales_price} onChange={e => setForm({ ...form, sales_price: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: parseInt(e.target.value) })}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body p-0">
            <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={setDeleteTarget} />
          </div>
        </div>
      </div>

      <ConfirmDelete
        show={!!deleteTarget}
        itemName={deleteTarget?.item_name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
