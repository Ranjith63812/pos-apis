import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getProducts } from '../api/productApi';
import { getCustomers } from '../api/customerApi';
import { getSuppliers } from '../api/supplierApi';
import { getSales } from '../api/salesApi';
import { getPurchases } from '../api/purchaseApi';
import { getExpenses } from '../api/expenseApi';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="col-md-4 col-sm-6">
      <div className={`stat-card border-start border-4 border-${color}`}>
        <div className="stat-icon">{icon}</div>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0, customers: 0, suppliers: 0,
    sales: 0, purchases: 0, expenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c, s, sl, pu, ex] = await Promise.allSettled([
          getProducts(), getCustomers(), getSuppliers(),
          getSales(), getPurchases(), getExpenses(),
        ]);
        setStats({
          products: p.value?.data?.length || 0,
          customers: c.value?.data?.length || 0,
          suppliers: s.value?.data?.length || 0,
          sales: sl.value?.data?.length || 0,
          purchases: pu.value?.data?.length || 0,
          expenses: ex.value?.data?.expenses?.length || ex.value?.data?.length || 0,
        });
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="page-content">
      <Navbar title="Dashboard" />
      <div className="content-body">
        <p className="text-muted mb-4">Welcome back, Admin! Here's a quick overview.</p>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="row g-4">
            <StatCard icon="📦" label="Products" value={stats.products} color="primary" />
            <StatCard icon="👥" label="Customers" value={stats.customers} color="success" />
            <StatCard icon="🏭" label="Suppliers" value={stats.suppliers} color="info" />
            <StatCard icon="💰" label="Sales" value={stats.sales} color="warning" />
            <StatCard icon="🛒" label="Purchases" value={stats.purchases} color="danger" />
            <StatCard icon="💸" label="Expenses" value={stats.expenses} color="secondary" />
          </div>
        )}
      </div>
    </div>
  );
}
