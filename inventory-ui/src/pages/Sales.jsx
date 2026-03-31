import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getSales, deleteSale } from '../api/salesApi';
import { 
  ShoppingBag, PlusCircle, RefreshCcw, Hourglass, 
  LayoutDashboard, Plus, ChevronDown, CheckCircle
} from 'lucide-react';

export default function Sales() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stats
  const [stats, setStats] = useState({ count: 0, total: 0, received: 0, due: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSales();
      const rows = res.data || [];
      setData(rows);

      // Calc exact stats to match UI logic
      let count = rows.length;
      let total = 0, received = 0, due = 0;
      rows.forEach(r => {
        total += parseFloat(r.total || 0);
        received += parseFloat(r.paid_payment || 0);
        due += parseFloat(r.due || 0);
      });
      setStats({ count, total, received, due });
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    await deleteSale(deleteTarget.sale_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'sales_date', label: 'Sales Date' },
    { key: 'sales_code', label: 'Sales Code' },
    { key: 'sales_status', label: 'Sales Status' },
    { key: 'reference_no', label: 'Reference No.' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'total', label: 'Total', render: r => `₹ ${(r.total ?? 0).toFixed(2)}` },
    { key: 'paid_payment', label: 'Paid Payment', render: r => `₹ ${(r.paid_payment ?? 0).toFixed(2)}` },
    { key: 'due', label: 'Due', render: r => `₹ ${(r.due ?? 0).toFixed(2)}` },
    { key: 'payment_status', label: 'Payment Status', render: r => {
      let bg = r.payment_status === 'Paid' ? 'bg-success' : 'bg-danger';
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
          <li><a className="dropdown-item" href="#">Edit</a></li>
          <li><hr className="dropdown-divider"/></li>
          <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); setDeleteTarget(r); }}>Delete</a></li>
        </ul>
      </div>
    )},
  ];

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Sales List <small className="text-muted fs-6 ms-2">View/Search Sold Items</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</a></li>
          <li className="breadcrumb-item active">Sales List</li>
        </ol>
      </section>

      <section className="content px-3">
        
        {/* The 4 Stat Boxes (AdminLTE style) */}
        <div className="row mb-4">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info rounded-1 text-white border-0" style={{ backgroundColor: '#00c0ef' }}>
              <div className="inner">
                <h3>{stats.count}</h3>
                <p>Total Invoices</p>
              </div>
              <div className="icon"><ShoppingBag /></div>
              <a href="#" className="small-box-footer">More info <i className="fa fa-arrow-circle-right"></i></a>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success rounded-1 text-white">
              <div className="inner">
                <h3>₹ {stats.total.toLocaleString()}</h3>
                <p>Total Invoices Amount</p>
              </div>
              <div className="icon"><PlusCircle /></div>
              <a href="#" className="small-box-footer">More info <i className="fa fa-arrow-circle-right"></i></a>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning rounded-1 text-white">
              <div className="inner">
                <h3>₹ {stats.received.toLocaleString()}</h3>
                <p>Total Received Amount</p>
              </div>
              <div className="icon"><RefreshCcw /></div>
              <a href="#" className="small-box-footer">More info <i className="fa fa-arrow-circle-right"></i></a>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger rounded-1 text-white">
              <div className="inner">
                <h3>₹ {stats.due.toLocaleString()}</h3>
                <p>Total Sales Due</p>
              </div>
              <div className="icon"><Hourglass /></div>
              <a href="#" className="small-box-footer">More info <i className="fa fa-arrow-circle-right"></i></a>
            </div>
          </div>
        </div>


        {/* Search / Filter Box */}
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="row g-3 d-flex align-items-end mb-4">
              <div className="col-md-3">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Customers</label>
                <select className="form-select rounded-0" style={{ fontSize: '14px' }}>
                  <option>Search Name/Mobile</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Created by</label>
                <select className="form-select rounded-0" style={{ fontSize: '14px' }}>
                  <option>-All Users-</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>From Date</label>
                <input type="date" className="form-control rounded-0" style={{ fontSize: '14px' }} />
              </div>
              <div className="col-md-2">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>To Date</label>
                <input type="date" className="form-control rounded-0" style={{ fontSize: '14px' }} />
              </div>
              <div className="col-md-2 text-end">
                <Link to="/sales/new" className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}>
                  <Plus size={16}/> New Sales
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
              customHeaderClass="bg-primary text-white"
            />
          </div>
        </div>

      </section>

      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.sales_code} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
