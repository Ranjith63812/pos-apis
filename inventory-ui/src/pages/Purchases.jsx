import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getPurchases, deletePurchase } from '../api/purchaseApi';

export default function Purchases() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const res = await getPurchases(); setData(res.data || []); } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    await deletePurchase(deleteTarget.purchase_id);
    setDeleteTarget(null); load();
  };

  const columns = [
    { key: 'purchase_code', label: 'Code' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'purchase_date', label: 'Date' },
    { key: 'total', label: 'Total', render: (r) => `₹${r.total ?? 0}` },
    { key: 'paid_payment', label: 'Paid', render: (r) => `₹${r.paid_payment ?? 0}` },
    { key: 'due', label: 'Due', render: (r) => <span className={r.due > 0 ? 'text-danger fw-semibold' : 'text-success'}>₹{r.due ?? 0}</span> },
    { key: 'payment_status', label: 'Status', render: (r) => {
      const color = r.payment_status === 'Paid' ? 'success' : r.payment_status === 'Unpaid' ? 'danger' : 'warning';
      return <span className={`badge bg-${color}`}>{r.payment_status}</span>;
    }},
    { key: 'purchase_status', label: 'Purchase Status' },
  ];

  return (
    <div className="page-content">
      <Navbar title="Purchases" />
      <div className="content-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">{data.length} records</h6>
        </div>
        <div className="card"><div className="card-body p-0">
          <DataTable columns={columns} data={data} loading={loading}
            onEdit={() => {}} onDelete={setDeleteTarget} />
        </div></div>
      </div>
      <ConfirmDelete show={!!deleteTarget} itemName={deleteTarget?.purchase_code}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
