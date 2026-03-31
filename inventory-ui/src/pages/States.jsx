import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getStates, createState, updateState, deleteState } from '../api/stateApi';
import { getCountries } from '../api/countryApi';   // ← needed for dropdown

// ── Empty form default values ──────────────────────────────────────────────────
const emptyForm = { state_name: '', country_id: '', status: 1 };

export default function States() {

  // ── State ─────────────────────────────────────────────────────────────────────
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);  // dropdown options
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Load states list from API ──────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await getStates();     // GET /states
      setData(res.data || []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  // ── Load country dropdown on first mount ───────────────────────────────────────
  useEffect(() => {
    load();
    getCountries().then(res => setCountries(res.data || [])).catch(() => {});
  }, []);

  // ── Open blank form for CREATE ─────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  // ── Open pre-filled form for EDIT ─────────────────────────────────────────────
  const openEdit = (row) => {
    setForm({
      state_name: row.state_name,
      country_id: row.country_id || '',  // pre-select the country in dropdown
      status: row.status ?? 1,
    });
    setEditId(row.state_id);
    setError('');
    setShowForm(true);
  };

  // ── Handle form submit (POST or PUT) ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.state_name.trim()) { setError('State name is required.'); return; }
    if (!form.country_id)        { setError('Please select a country.'); return; }

    setSaving(true);
    try {
      if (editId) {
        await updateState(editId, form);  // PUT /states?id=x
      } else {
        await createState(form);           // POST /states
      }
      setShowForm(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save.';
      setError(msg);
    }
    setSaving(false);
  };

  // ── Handle delete confirm ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    await deleteState(deleteTarget.state_id);  // DELETE /states?id=x
    setDeleteTarget(null);
    load();
  };

  // ── Table column definitions ──────────────────────────────────────────────────
  const columns = [
    { key: 'state_name', label: 'State Name' },
    { key: 'country_name', label: 'Country' },   // joined from API
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
      <Navbar title="States" />

      <div className="content-body">

        {/* ── Header row ── */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add State
          </button>
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="card card-form mb-4">
            <div className="card-body">
              <h6 className="mb-3">{editId ? 'Edit State' : 'Add State'}</h6>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit} className="row g-3">

                {/* State Name */}
                <div className="col-md-4">
                  <label className="form-label">State Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    placeholder="e.g. Tamil Nadu"
                    value={form.state_name}
                    onChange={e => setForm({ ...form, state_name: e.target.value })}
                  />
                </div>

                {/* Country Dropdown — populated from GET /countries ── */}
                <div className="col-md-4">
                  <label className="form-label">Country <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.country_id}
                    onChange={e => setForm({ ...form, country_id: e.target.value })}
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map(c => (
                      <option key={c.country_id} value={c.country_id}>
                        {c.country_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-4">
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

        {/* ── States Table ── */}
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
        itemName={deleteTarget?.state_name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
