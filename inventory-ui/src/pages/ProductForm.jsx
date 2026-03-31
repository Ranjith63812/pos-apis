import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProduct, createProduct, updateProduct } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getBrands } from '../api/brandApi';
import { getUnits } from '../api/unitApi';
import { getTaxes } from '../api/taxApi';
import { LayoutDashboard, Save, ArrowLeft, Package, Image as ImageIcon } from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    tax_id: '',
    tax_type: 'Exclusive',
    price: 0,
    stock: 0,
    alert_quantity: 1,
    description: '',
    image: null
  });

  const [masters, setMasters] = useState({
    categories: [], brands: [], units: [], taxes: []
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [c, b, u, t] = await Promise.all([
          getCategories(), getBrands(), getUnits(), getTaxes()
        ]);
        setMasters({
          categories: c.data?.data || c.data || [],
          brands: b.data?.data || b.data || [],
          units: u.data?.data || u.data || [],
          taxes: t.data?.data || t.data || []
        });

        if (id) {
          const res = await getProduct(id);
          const p = res.data?.data || res.data;
          if (p) setFormData(p);
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      }
    };
    fetchMasters();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app with file upload, we'd use FormData. 
      // For this API, we'll send it as a regular object first.
      if (id) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate('/products');
    } catch (err) {
      alert('Failed to save product.');
    }
    setLoading(false);
  };

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          {id ? 'Edit Item' : 'New Item'} <small className="text-muted fs-6 ms-2">Manage inventory items</small>
        </h1>
        <ol className="breadcrumb m-0 bg-transparent p-0 float-end" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted"><LayoutDashboard size={12} className="me-1"/> Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Items</Link></li>
          <li className="breadcrumb-item active">{id ? 'Edit' : 'Add'}</li>
        </ol>
      </section>

      <section className="content px-3 pb-5">
        <div className="box box-info border-top-0 rounded-0 shadow-sm">
          <div className="box-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
             <div className="d-flex align-items-center gap-2">
                <Package size={20} className="text-info" />
                <h3 className="box-title m-0 fs-6 fw-bold text-dark">Item Information</h3>
             </div>
             <Link to="/products" className="btn btn-default btn-sm border rounded-0 px-3 d-flex align-items-center gap-1">
                <ArrowLeft size={14}/> Back to List
             </Link>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="box-body p-4 bg-white">
              <div className="row g-4">
                {/* Left Column: Core Info */}
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold small text-muted">ITEM NAME <span className="text-danger">*</span></label>
                      <input type="text" name="product_name" className="form-control rounded-0 shadow-none border-secondary-subtle" required value={formData.product_name} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">CATEGORY <span className="text-danger">*</span></label>
                      <select name="category_id" className="form-select rounded-0 shadow-none border-secondary-subtle" required value={formData.category_id} onChange={handleChange}>
                        <option value="">-- Select --</option>
                        {masters.categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">BRAND</label>
                      <select name="brand_id" className="form-select rounded-0 shadow-none border-secondary-subtle" value={formData.brand_id} onChange={handleChange}>
                        <option value="">-- Select --</option>
                        {masters.brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">UNIT <span className="text-danger">*</span></label>
                      <select name="unit_id" className="form-select rounded-0 shadow-none border-secondary-subtle" required value={formData.unit_id} onChange={handleChange}>
                        <option value="">-- Select --</option>
                        {masters.units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">STOCK <span className="text-danger">*</span></label>
                      <input type="number" name="stock" className="form-control rounded-0 shadow-none border-secondary-subtle" required value={formData.stock} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">PRICE (₹) <span className="text-danger">*</span></label>
                      <input type="number" name="price" className="form-control rounded-0 shadow-none border-secondary-subtle" required value={formData.price} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">TAX</label>
                      <select name="tax_id" className="form-select rounded-0 shadow-none border-secondary-subtle" value={formData.tax_id} onChange={handleChange}>
                        <option value="">-- None --</option>
                        {masters.taxes.map(t => <option key={t.tax_id} value={t.tax_id}>{t.tax_name}</option>)}
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold small text-muted">DESCRIPTION</label>
                      <textarea name="description" rows={3} className="form-control rounded-0 shadow-none border-secondary-subtle" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                  </div>
                </div>

                {/* Right Column: Meta & Image */}
                <div className="col-md-4">
                  <div className="p-3 bg-light border border-dashed rounded-0 text-center mb-4">
                    <div className="mb-3">
                      <ImageIcon size={48} className="text-muted opacity-25" />
                    </div>
                    <label className="form-label fw-bold small text-muted">ITEM IMAGE</label>
                    <input type="file" name="image" className="form-control form-control-sm rounded-0 border-secondary-subtle" onChange={handleChange} />
                    <p className="text-muted mt-2 small">Max size 2MB. Format: JPG, PNG</p>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                       <label className="form-label fw-bold small text-muted">TAX TYPE</label>
                       <select name="tax_type" className="form-select rounded-0 shadow-none border-secondary-subtle" value={formData.tax_type} onChange={handleChange}>
                         <option value="Exclusive">Exclusive</option>
                         <option value="Inclusive">Inclusive</option>
                       </select>
                    </div>
                    <div className="col-12">
                       <label className="form-label fw-bold small text-muted">ALERT QUANTITY</label>
                       <input type="number" name="alert_quantity" className="form-control rounded-0 shadow-none border-secondary-subtle" value={formData.alert_quantity} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="box-footer p-4 bg-transparent border-top d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-default btn-sm border rounded-0 px-4 py-2" onClick={() => navigate('/products')}>Cancel</button>
              <button type="submit" className="btn btn-info btn-sm text-white rounded-0 px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow" style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }} disabled={loading}>
                 {loading ? <span className="spinner-border spinner-border-sm"></span> : <Save size={16}/>}
                 {id ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
