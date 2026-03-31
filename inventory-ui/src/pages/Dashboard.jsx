import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { getCustomers } from '../api/customerApi';
import { getSuppliers } from '../api/supplierApi';
import { getSales } from '../api/salesApi';
import { getPurchases } from '../api/purchaseApi';
import { getExpenses } from '../api/expenseApi';
import { 
  Package, Users, Truck, ShoppingCart, 
  CircleDollarSign, Receipt, LayoutDashboard, ChevronDown
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0, customers: 0, suppliers: 0,
    sales: 0, purchases: 0, expenses: 0,
    revenue: 0, expenseTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c, s, sl, pu, ex] = await Promise.allSettled([
          getProducts(), getCustomers(), getSuppliers(),
          getSales(), getPurchases(), getExpenses(),
        ]);
        
        const salesList = sl.value?.data || [];
        const expenseList = ex.value?.data?.expenses || ex.value?.data || [];
        
        setStats({
          products: p.value?.data?.data?.length || p.value?.data?.length || 0,
          customers: c.value?.data?.data?.length || c.value?.data?.length || 0,
          suppliers: s.value?.data?.data?.length || s.value?.data?.length || 0,
          sales: salesList.length,
          purchases: pu.value?.data?.data?.length || pu.value?.data?.length || 0,
          expenses: expenseList.length,
          revenue: salesList.reduce((sum, item) => sum + (item.total || 0), 0),
          expenseTotal: expenseList.reduce((sum, item) => sum + (item.amount || 0), 0)
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Dashboard <small className="text-muted fs-6 ms-2">Control panel</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Dashboard</li>
        </ol>
      </section>

      <section className="content px-3 pb-5">
        <div className="row g-3 mb-4">
          {/* Sales Card */}
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info rounded-1 text-white">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.sales}</h3>
                <p className="mb-0">Total Sales</p>
              </div>
              <div className="icon">
                <ShoppingCart size={60} opacity={0.2} />
              </div>
              <Link to="/sales" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.revenue.toLocaleString()}</h3>
                <p className="mb-0">Total Revenue</p>
              </div>
              <div className="icon">
                <CircleDollarSign size={60} opacity={0.2} />
              </div>
              <Link to="/sales" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.expenseTotal.toLocaleString()}</h3>
                <p className="mb-0">Total Expenses</p>
              </div>
              <div className="icon">
                <Receipt size={60} opacity={0.2} />
              </div>
              <Link to="/expenses" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>

          {/* Products Card */}
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning text-dark rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.products}</h3>
                <p className="mb-0">Products in Stock</p>
              </div>
              <div className="icon">
                <Package size={60} opacity={0.2} />
              </div>
              <Link to="/products" className="small-box-footer text-decoration-none py-1 d-block text-center text-dark-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
              <div className="box-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h3 className="box-title m-0 fs-6 fw-bold">Recent Status</h3>
                <div className="box-tools">
                   <button className="btn btn-box-tool btn-sm border-0 bg-transparent text-muted"><ChevronDown size={14}/></button>
                </div>
              </div>
              <div className="box-body p-4 bg-white" style={{ minHeight: '300px' }}>
                <div className="row text-center align-items-center">
                  <div className="col-md-6 border-end">
                    <h2 className="fw-bold text-info mb-0">{stats.customers}</h2>
                    <p className="text-muted small">TOTAL CUSTOMERS</p>
                  </div>
                  <div className="col-md-6">
                    <h2 className="fw-bold text-success mb-0">{stats.suppliers}</h2>
                    <p className="text-muted small">ACTIVE SUPPLIERS</p>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="text-center text-muted">
                   <p className="small">Welcome to the Ultimate Inventory Dashboard. Manage your sales, purchases, and stock items with ease.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="box box-danger border-top-0 rounded-0 shadow-sm mb-4">
              <div className="box-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h3 className="box-title m-0 fs-6 fw-bold">Quick Actions</h3>
              </div>
              <div className="box-body p-4 bg-white" style={{ minHeight: '300px' }}>
                 <div className="d-grid gap-3">
                    <Link to="/sales/new" className="btn btn-outline-info rounded-0 py-2 d-flex align-items-center justify-content-center gap-2">
                       <ShoppingCart size={18}/> Process New sale
                    </Link>
                    <Link to="/purchases/new" className="btn btn-outline-success rounded-0 py-2 d-flex align-items-center justify-content-center gap-2">
                       <Truck size={18}/> record New purchase
                    </Link>
                    <Link to="/products" className="btn btn-outline-warning text-dark rounded-0 py-2 d-flex align-items-center justify-content-center gap-2">
                       <Package size={18}/> Manage Inventory
                    </Link>
                    <Link to="/expenses" className="btn btn-outline-danger rounded-0 py-2 d-flex align-items-center justify-content-center gap-2">
                       <Receipt size={18}/> Add Expense
                    </Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
