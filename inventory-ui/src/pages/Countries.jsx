import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getCountries, createCountry, updateCountry, deleteCountry } from '../api/countryApi';

// ── Empty form default values ──────────────────────────────────────────────────
const emptyForm = { country_name: '', status: 1 };

export default function Countries() {

  // ── State ─────────────────────────────────────────────────────────────────────
  const [data, setData] = useState([]);           // list of countries from API
  const [loading, setLoading] = useState(true);   // table loading state
  const [showForm, setShowForm] = useState(false); // toggle add/edit form
  const [form, setForm] = useState(emptyForm);     // form field values
  const [editId, setEditId] = useState(null);      // null = create, number = update
  const [deleteTarget, setDeleteTarget] = useState(null); // row to delete
  const [saving, setSaving] = useState(false);     // save button loading
  const [error, setError] = useState('');          // form error message

  // ── Load all countries from API ────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await getCountries();   // GET /countries
      setData(res.data || []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // run on first mount

  // ── Open blank form for CREATE ─────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  // ── Open pre-filled form for EDIT ─────────────────────────────────────────────
  const openEdit = (row) => {
    setForm({ country_name: row.country_name, status: row.status ?? 1 });
    setEditId(row.country_id);
    setError('');
    setShowForm(true);
  };

  // ── Handle form submit (POST or PUT) ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.country_name.trim()) {
      setError('Country name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateCountry(editId, form);  // PUT /countries?id=x
      } else {
        await createCountry(form);           // POST /countries
      }
      setShowForm(false);
      load();                                // refresh the table
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save.';
      setError(msg);
    }
    setSaving(false);
  };

  // ── Handle delete confirm ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    await deleteCountry(deleteTarget.country_id);  // DELETE /countries?id=x
    setDeleteTarget(null);
    load();
  };

  // ── Table column definitions ──────────────────────────────────────────────────
  const columns = [
    { key: 'country_name', label: 'Country Name' },
    {
      key: 'status', label: 'Status',
      render: (row) => row.status === 1
        ? <span className="badge bg-success">Active</span>
        : <span className="badge bg-secondary">Inactive</span>
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      <Navbar title="Countries" />

      <div className="content-body">

        {/* ── Header row ── */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Country
          </button>
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="card card-form mb-4">
            <div className="card-body">
              <h6 className="mb-3">{editId ? 'Edit Country' : 'Add Country'}</h6>

              {/* Error alert */}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit} className="row g-3">

                {/* Country Name */}
                <div className="col-md-6">
                  <label className="form-label">Country Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    placeholder="e.g. India"
                    value={form.country_name}
                    onChange={e => setForm({ ...form, country_name: e.target.value })}
                  />
                </div>

                {/* Status */}
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: parseInt(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editId ? 'Update' : 'Save'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Countries Table ── */}
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmDelete
        show={!!deleteTarget}
        itemName={deleteTarget?.country_name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
