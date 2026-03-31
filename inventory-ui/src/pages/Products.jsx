import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmDelete from '../components/ConfirmDelete';
import { getProducts, deleteProduct } from '../api/productApi';
import { LayoutDashboard, Plus, ChevronDown, Package, ShieldAlert, Archive, Tags } from 'lucide-react';

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      // Handle the data structure (nested in .data or direct array)
      const list = res.data?.data || res.data || [];
      setData(list);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.product_id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert('Failed to delete product. It may be linked to sales/purchases.');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = data.length;
    const lowStock = data.filter(p => (p.current_stock || 0) <= 5).length;
    const categories = new Set(data.map(p => p.category_name).filter(Boolean)).size;
    const value = data.reduce((sum, p) => sum + (p.price || 0) * (p.current_stock || 0), 0);
    return { total, lowStock, categories, value };
  }, [data]);

  const columns = [
    { key: 'item_name', label: 'Item Name', render: r => (
      <div className="d-flex align-items-center gap-2">
        {r.product_image && <img src={r.product_image} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover' }} className="rounded-1 border" />}
        <span className="fw-bold text-primary">{r.item_name}</span>
      </div>
    )},
    { key: 'category_name', label: 'Category' },
    { key: 'brand_name', label: 'Brand' },
    { key: 'price', label: 'Price', render: r => `₹ ${(r.price ?? 0).toFixed(2)}` },
    { key: 'sales_price', label: 'Sales Price', render: r => `₹ ${(r.sales_price ?? 0).toFixed(2)}` },
    { key: 'current_stock', label: 'Stock', render: r => {
      const stock = r.current_stock ?? 0;
      const color = stock > 10 ? 'text-success' : stock > 0 ? 'text-warning' : 'text-danger';
      return <span className={`fw-bold ${color}`}>{stock}</span>;
    }},
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
          <li><Link className="dropdown-item" to={`/products/edit/${r.product_id}`}>Edit</Link></li>
          <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); setDeleteTarget(r); }}>Delete</a></li>
        </ul>
      </div>
    )},
  ];

  return (
    <>
      {/* Header */}
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          Items List <small className="text-muted fs-6 ms-2">Manage your inventory products</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item active">Items List</li>
        </ol>
      </section>

      {/* Stats Section */}
      <section className="content px-3 mb-4">
        <div className="row g-3">
          <div className="col-lg-3 col-6">
            <div className="small-box bg-info rounded-1 text-white">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.total}</h3>
                <p className="mb-0">Total Products</p>
              </div>
              <div className="icon">
                <Package size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-warning text-dark rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.lowStock}</h3>
                <p className="mb-0">Low / Out of Stock</p>
              </div>
              <div className="icon">
                <ShieldAlert size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-dark-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-success text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">₹ {stats.value.toLocaleString()}</h3>
                <p className="mb-0">Inventory Value</p>
              </div>
              <div className="icon">
                <Archive size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <div className="small-box bg-danger text-white rounded-1">
              <div className="inner p-3">
                <h3 className="mb-0 fw-bold">{stats.categories}</h3>
                <p className="mb-0">Categories</p>
              </div>
              <div className="icon">
                <Tags size={60} opacity={0.2} />
              </div>
              <Link to="#" className="small-box-footer text-decoration-none py-1 d-block text-center text-white-50">
                More info <ChevronDown size={12} className="ms-1"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main List Container */}
      <section className="content px-3 pb-5">
        <div className="box box-primary border-top-0 rounded-0 shadow-sm mb-4">
          <div className="box-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0 text-muted fs-6">Products Data</h5>
              </div>
              <div className="text-end">
                <Link to="/products/new" className="btn btn-info text-white rounded-0 d-inline-flex gap-1 align-items-center" style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}>
                  <Plus size={16}/> New Product
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
        itemName={deleteTarget?.item_name} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteTarget(null)} 
      />
    </>
  );
}
