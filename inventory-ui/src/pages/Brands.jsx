import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import ResourceModal from '../components/ResourceModal';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../api/brandApi';
import { LayoutDashboard, Plus, ChevronDown, Award } from 'lucide-react';

export default function Brands() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBrands();
      const list = res.data?.data || res.data || [];
      setData(list);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (formData) => {
    if (editItem) {
      await updateBrand(editItem.brand_id, formData);
    } else {
      await createBrand(formData);
    }
    setModalShow(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBrand(deleteTarget.brand_id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert('Failed to delete brand. It may be linked to products.');
    }
  };

  const columns = [
    { key: 'brand_name', label: 'Brand Name', render: r => <span className="fw-bold text-primary">{r.brand_name}</span> },
    { key: 'brand_code', label: 'Brand Code' },
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
    { key: 'brand_name', label: 'Brand Name', required: true, placeholder: 'e.g. Samsung' },
    { key: 'brand_code', label: 'Brand Code', placeholder: 'e.g. SML' },
    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true, placeholder: 'Optional description...' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }], defaultValue: 1 },
  ];

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Brands List <small className="text-muted fs-6 ms-2">Manage product brands</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Brand List</li>
        </ol>
      </section>

      <section className="content px-3 pb-5">
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <Award size={20} className="text-muted" />
                <h5 className="mb-0 text-muted fs-6">Brands Data</h5>
              </div>
              <div className="text-end">
                <button 
                  className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" 
                  style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}
                  onClick={() => { setEditItem(null); setModalShow(true); }}
                >
                  <Plus size={16}/> New Brand
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
        title="Brand" 
        item={editItem} 
        fields={fields} 
        onSave={handleSave} 
        onCancel={() => setModalShow(false)} 
      />

      <ConfirmDelete 
        show={!!deleteTarget} 
        itemName={deleteTarget?.brand_name} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteTarget(null)} 
      />
    </>
  );
}
