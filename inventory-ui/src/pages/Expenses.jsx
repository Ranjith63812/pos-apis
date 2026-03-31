import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';

const emptyForm = { expense_date: '', category_id: '', reference_no: '', expense_for: '', amount: '', note: '', created_by: 1 };

export default function Expenses() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
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
      const res = await getExpenses();
      setData(res.data?.expenses || res.data || []);
      setTotal(res.data?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (row) => {
    setForm({ expense_date: row.expense_date || '', category_id: row.category_id || '',
      reference_no: row.reference_no || '', expense_for: row.expense_for || '',
      amount: row.amount || '', note: row.note || '', created_by: 1 });
    setEditId(row.expense_id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expense_date || !form.amount) { setError('Date and amount are required.'); return; }
    setSaving(true);
    try {
      if (editId) await updateExpense(editId, form);
      else await createExpense(form);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteExpense(deleteTarget.expense_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'expense_date', label: 'Date' },
    { key: 'category_name', label: 'Category' },
    { key: 'expense_for', label: 'For' },
    { key: 'reference_no', label: 'Reference' },
    { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount ?? 0}` },
    { key: 'note', label: 'Note' },
  ];

  return (
    <div className="page-content">
      <Navbar title="Expenses" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="text-muted mb-0">{data.length} records</h6>
            <small className="text-danger fw-semibold">Total: ₹{total}</small>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Expense</button>
        </div>
        {showForm && (
          <div className="card card-form mb-4"><div className="card-body">
            <h6 className="mb-3">{editId ? 'Edit Expense' : 'Add Expense'}</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4"><label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
              </div>
              <div className="col-md-4"><label className="form-label">Category ID</label>
                <input type="number" className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} />
              </div>
              <div className="col-md-4"><label className="form-label">Reference No</label>
                <input className="form-control" value={form.reference_no} onChange={e => setForm({ ...form, reference_no: e.target.value })} />
              </div>
              <div className="col-md-4"><label className="form-label">Expense For</label>
                <input className="form-control" value={form.expense_for} onChange={e => setForm({ ...form, expense_for: e.target.value })} />
              </div>
              <div className="col-md-4"><label className="form-label">Amount *</label>
                <input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="col-md-4"><label className="form-label">Note</label>
                <input className="form-control" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
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
      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.expense_for || 'this expense'}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
