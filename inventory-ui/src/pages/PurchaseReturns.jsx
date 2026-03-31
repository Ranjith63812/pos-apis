import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getPurchaseReturns, deletePurchaseReturn } from '../api/purchaseReturnApi';
import { LayoutDashboard, Plus, ChevronDown } from 'lucide-react';

export default function PurchaseReturns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseReturns();
      setData(res.data || []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePurchaseReturn(deleteTarget.purchase_return_id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('Failed to delete purchase return:', err);
      alert('Failed to delete purchase return. Please check if it is linked to other records.');
    }
  };

  const columns = [
    { key: 'return_date', label: 'Return Date' },
    { key: 'return_code', label: 'Return Code' },
    { key: 'purchase_code', label: 'Purchase Code' },
    { key: 'reference_no', label: 'Reference No.' },
    { key: 'supplier_name', label: 'Supplier Name' },
    { key: 'total', label: 'Total', render: r => `₹ ${(r.total ?? 0).toFixed(2)}` },
    { key: 'paid_payment', label: 'Paid Payment', render: r => `₹ ${(r.paid_payment ?? 0).toFixed(2)}` },
    { key: 'due', label: 'Due', render: r => `₹ ${(r.due ?? 0).toFixed(2)}` },
    { key: 'payment_status', label: 'Payment Status', render: r => {
      let bg = r.payment_status === 'Paid' ? 'bg-success' : r.payment_status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger';
      return <span className={`badge ${bg} rounded-1 px-2 py-1`}>{r.payment_status}</span>;
    }},
    { key: 'created_by', label: 'Created by' },
    { key: 'action', label: 'Action', render: r => (
      <div className="btn-group">
        <button type="button" className="btn btn-info btn-sm dropdown-toggle rounded-0 text-white border-0" data-bs-toggle="dropdown" aria-expanded="false" style={{ backgroundColor: '#3c8dbc' }}>
          Action <ChevronDown size={14} className="ms-1"/>
        </button>
        <ul className="dropdown-menu shadow-sm rounded-0">
          <li><a className="dropdown-item" href="#">View</a></li>
          <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); setDeleteTarget(r); }}>Delete</a></li>
        </ul>
      </div>
    )},
  ];

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Purchase Returns List <small className="text-muted fs-6 ms-2">View/Search Returned Purchases</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Purchase Returns</li>
        </ol>
      </section>

      <section className="content px-3">
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="row g-3 d-flex align-items-end mb-4">
               <div className="col-md-2 offset-md-10 text-end">
                <Link to="/purchase-returns/new" className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}>
                  <Plus size={16}/> New Return
                </Link>
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

      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.return_code} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
