import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import ConfirmDelete from './ConfirmDelete';
import { PlusCircle, X, Save, DownloadCloud, Printer, FileText, FileSpreadsheet } from 'lucide-react';

/**
 * Reusable premium CRUD page.
 * Props:
 *  - title (string): Page title
 *  - subtitle (string): Page subtitle
 *  - columns (array): DataTable column definitions
 *  - fields (array): Form field definitions [{key, label, type, required, options}]
 *  - emptyForm (object): Default form state
 *  - idKey (string): The primary key field name e.g. 'product_id'
 *  - nameKey (string): Field to display in delete confirmation
 *  - fetchFn: async function to load list
 *  - createFn: async function to create
 *  - updateFn: async function(id, data) to update
 *  - deleteFn: async function(id) to delete
 *  - parseData (fn): optional transform on loaded data array
 *  - parseEditRow (fn): optional transform row to form state
 */
export default function CrudPage({
  title, subtitle, columns, fields, emptyForm,
  idKey, nameKey,
  fetchFn, createFn, updateFn, deleteFn,
  parseData, parseEditRow
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      const raw = res.data?.data || res.data || [];
      setData(parseData ? parseData(raw) : raw);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setShowForm(true); };

  const openEdit = (row) => {
    const defaults = {};
    fields.forEach(f => { defaults[f.key] = row[f.key] ?? ''; });
    setForm(parseEditRow ? parseEditRow(row) : defaults);
    setEditId(row[idKey]);
    setError('');
    setShowForm(true);
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const req = fields.find(f => f.required && !form[f.key]);
    if (req) { setError(`${req.label} is required.`); return; }
    setSaving(true);
    try {
      if (editId) await updateFn(editId, form);
      else await createFn(form);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteFn(deleteTarget[idKey]);
    setDeleteTarget(null);
    load();
  };

  const filtered = data.filter(row =>
    !search || Object.values(row).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">{title}</h4>
          {subtitle && <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{subtitle}</p>}
        </div>
        <button className="btn-premium btn-primary-premium" onClick={openCreate}>
          <PlusCircle size={18} /> Add {title.replace(' List', '')}
        </button>
      </div>

      {/* Inline Form Card */}
      {showForm && (
        <div className="card-premium mb-4">
          <div className="card-header-premium">
            <h3 className="card-title-premium">{editId ? `Edit ${title}` : `Add New ${title}`}</h3>
            <button className="btn btn-sm btn-light border-0" onClick={() => setShowForm(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="card-body-premium">
            {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {fields.map(f => (
                  <div key={f.key} className={f.fullWidth ? 'col-12' : 'col-md-4'}>
                    <label className="form-label-premium">
                      {f.label} {f.required && <span className="text-danger">*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        className="form-select form-control-premium"
                        value={form[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                      >
                        {f.options.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        className="form-control form-control-premium"
                        rows={3}
                        value={form[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                      />
                    ) : (
                      <input
                        type={f.type || 'text'}
                        className="form-control form-control-premium"
                        value={form[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2 mt-4">
                <button className="btn-premium btn-primary-premium" type="submit" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn-premium btn-light-premium" type="button" onClick={() => setShowForm(false)}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="card-premium">
        <div className="px-4 pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
            {filtered.length} of {data.length} records
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"><FileText size={14} /> Copy</button>
            <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"><FileSpreadsheet size={14} /> Excel</button>
            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"><DownloadCloud size={14} /> PDF</button>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"><Printer size={14} /> Print</button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>Search:</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '200px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter records..."
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />

        <div className="px-4 py-3 border-top d-flex justify-content-between align-items-center">
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {data.length} entries
          </div>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><button className="page-link">Previous</button></li>
            <li className="page-item active"><button className="page-link">1</button></li>
            <li className="page-item disabled"><button className="page-link">Next</button></li>
          </ul>
        </div>
      </div>

      <ConfirmDelete
        show={!!deleteTarget}
        itemName={deleteTarget?.[nameKey]}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
