import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getPurchases, deletePurchase } from '../api/purchaseApi';
import { LayoutDashboard, Plus, ChevronDown, ShoppingCart, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';

export default function Purchases() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPurchases();
      // Assume res.data is the list or res.data.data
      const list = res.data?.data || res.data || [];
      setData(list);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePurchase(deleteTarget.purchase_id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert('Failed to delete purchase. It may be linked to returns.');
    }
  };

  const stats = useMemo(() => {
    const totalCount = data.length;
    const totalValue = data.reduce((sum, p) => sum + (p.total || 0), 0);
    const paidValue = data.reduce((sum, p) => sum + (p.paid_payment || 0), 0);
    const dueValue = data.reduce((sum, p) => sum + (p.due || 0), 0);
    return { totalCount, totalValue, paidValue, dueValue };
  }, [data]);

  const columns = [
    { key: 'purchase_date', label: 'Date' },
    { key: 'purchase_code', label: 'Purchase Code' },
    { key: 'purchase_status', label: 'Purchase Status', render: r => {
       const bg = r.purchase_status === 'Received' ? 'bg-success' : 'bg-warning text-dark';
       return <span className={`badge ${bg} rounded-1 px-2 py-1`}>{r.purchase_status}</span>;
    }},
    { key: 'supplier_name', label: 'Supplier Name' },
    { key: 'total', label: 'Total', render: r => `₹ ${(r.total ?? 0).toFixed(2)}` },
    { key: 'paid_payment', label: 'Paid Payment', render: r => `₹ ${(r.paid_payment ?? 0).toFixed(2)}` },
    { key: 'due', label: 'Due', render: r => {
       const color = r.due > 0 ? 'text-danger fw-bold' : 'text-success';
       return <span className={color}>₹ {(r.due ?? 0).toFixed(2)}</span>;
    }},
    { key: 'payment_status', label: 'Payment Status', render: r => {
       const bg = r.payment_status === 'Paid' ? 'bg-success' : r.payment_status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger';
       return <span className={`badge ${bg} rounded-1 px-2 py-1`}>{r.payment_status}</span>;
    }},
    { key: 'created_by', label: 'Created by' },
    { key: 'action', label: 'Action', render: r => (
      <div className="btn-group">
        <button type="button" className="btn btn-info btn-sm dropdown-toggle rounded-0 text-white border-0" data-bs-toggle="dropdown" style={{ backgroundColor: '#3c8dbc' }}>
          Action <ChevronDown size={14} className="ms-1"/>
        </button>
        <ul className="dropdown-menu shadow-sm rounded-0">
          <li><a className="dropdown-item" href="#">View</a></li>
          <li><a className="dropdown-item" href="#">Edit</a></li>
          <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); setDeleteTarget(r); }}>Delete</a></li>
        </ul>
      </div>
    )},
  ];

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Purchases List <small className="text-muted fs-6 ms-2">View/Search Purchase Records</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Purchase List</li>
        </ol>
      </section>

      <section className="content px-3 mb-4">
        <div className="row g-3">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info rounded-1 text-white">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.totalCount}</h3>
                <p className="mb-0">Total Purchases</p>
              </div>
              <div className="icon">
                <ShoppingCart size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.totalValue.toLocaleString()}</h3>
                <p className="mb-0">Total Purchase Amount</p>
              </div>
              <div className="icon">
                <CheckCircle size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning text-dark rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.paidValue.toLocaleString()}</h3>
                <p className="mb-0">Total Paid Amount</p>
              </div>
              <div className="icon">
                <AlertCircle size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-dark-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.dueValue.toLocaleString()}</h3>
                <p className="mb-0">Total Payment Due</p>
              </div>
              <div className="icon">
                <TrendingDown size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content px-3 pb-5">
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <ShoppingCart size={20} className="text-muted" />
                <h5 className="mb-0 text-muted fs-6">Purchases Data</h5>
              </div>
              <div className="text-end">
                <Link to="/purchases/new" className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}>
                  <Plus size={16}/> New Purchase
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

      <ConfirmDelete 
        show={!!deleteTarget} 
        itemName={deleteTarget?.purchase_code} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteTarget(null)} 
      />
    </>
  );
}
