import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import ResourceModal from '../components/ResourceModal';
import { getUnits, createUnit, updateUnit, deleteUnit } from '../api/unitApi';
import { LayoutDashboard, Plus, ChevronDown, Package } from 'lucide-react';

export default function Units() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUnits();
      const list = res.data?.data || res.data || [];
      setData(list);
    } catch (err) {
      console.error('Failed to fetch units:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (formData) => {
    if (editItem) {
      await updateUnit(editItem.unit_id, formData);
    } else {
      await createUnit(formData);
    }
    setModalShow(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUnit(deleteTarget.unit_id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert('Failed to delete unit.');
    }
  };

  const columns = [
    { key: 'unit_name', label: 'Unit Name', render: r => <span className="fw-bold text-primary">{r.unit_name}</span> },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status', render: r => {
      let bg = r.status === 1 ? 'bg-success' : 'bg-danger';
      return <span className={`badge ${bg} rounded-1 px-2 py-1`}>{r.status === 1 ? 'Active' : 'Inactive'}</span>;
    }},
    { key: 'action', label: 'Action', render: r => (
      <div className="btn-group">
        <button type="button" className="btn btn-info btn-sm dropdown-toggle rounded-0 text-white border-0" data-bs-toggle="dropdown" style={{ backgroundColor: '#3c8dbc' }}>
          Action <ChevronDown size={14} className="ms-1"/>
        </button>
        <ul className="dropdown-menu shadow-sm rounded-0">
          <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setEditItem(r); setModalShow(true); }}>Edit</a></li>
          <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); setDeleteTarget(r); }}>Delete</a></li>
        </ul>
      </div>
    )},
  ];

  const fields = [
    { key: 'unit_name', label: 'Unit Name', required: true, placeholder: 'e.g. Kilograms' },
    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Optional description...' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }], defaultValue: 1 },
  ];

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Units List <small className="text-muted fs-6 ms-2">Manage measuring units</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Unit List</li>
        </ol>
      </section>

      <section className="content px-3 pb-5">
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <Package size={20} className="text-muted" />
                <h5 className="mb-0 text-muted fs-6">Units Data</h5>
              </div>
              <div className="text-end">
                <button 
                  className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" 
                  style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}
                  onClick={() => { setEditItem(null); setModalShow(true); }}
                >
                  <Plus size={16}/> New Unit
                </button>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-sm-6 d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                <span>Show</span>
                <select className="form-select form-select-sm rounded-0 d-inline-block w-auto shadow-none">
                  <option>10</option><option>25</option><option>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="col-sm-6 d-flex align-items-center justify-content-sm-end gap-2" style={{ fontSize: '14px' }}>
                <span>Search:</span>
                <input type="text" className="form-control form-control-sm rounded-0 shadow-none w-auto" style={{ minWidth: '200px' }} />
              </div>
            </div>

            <DataTable 
              columns={columns} 
              data={data} 
              loading={loading} 
              onEdit={() => {}} 
              onDelete={setDeleteTarget} 
            />
          </div>
        </div>
      </section>

      <ResourceModal 
        show={modalShow} 
        title="Unit" 
        item={editItem} 
        fields={fields} 
        onSave={handleSave} 
        onCancel={() => setModalShow(false)} 
      />

      <ConfirmDelete 
        show={!!deleteTarget} 
        itemName={deleteTarget?.unit_name} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteTarget(null)} 
      />
    </>
  );
}
