import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuppliers } from '../api/supplierApi';
import { getProducts } from '../api/productApi';
import { createPurchase } from '../api/purchaseApi';
import { Plus, Trash2, Save, X, Search, CreditCard, Box } from 'lucide-react';

export default function NewPurchase() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [header, setHeader] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    status: 'Received'
  });

  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, payment_type_id: 1, note: '' });

  const subtotal = useMemo(() =>
    items.reduce((sum, i) => sum + (i.quantity * i.unit_price) + i.tax_amount, 0), [items]);

  const grandTotal = subtotal;
  const dueAmount = grandTotal - parseFloat(payment.amount || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([getSuppliers(), getProducts()]);
        setSuppliers(supRes.data || []);
        setProducts(prodRes.data?.data || prodRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    if (!productId || items.find(i => i.product_id === productId)) { e.target.value = ''; return; }
    const product = products.find(p => p.product_id === productId);
    if (product) {
      setItems([...items, {
        product_id: product.product_id,
        item_name: product.item_name,
        quantity: 1,
        unit_price: product.purchase_price || 0,
        tax_amount: 0,
      }]);
    }
    e.target.value = '';
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;
    setItems(newItems);
  };

  const removeItem = (index) => { const n = [...items]; n.splice(index, 1); setItems(n); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.supplier_id) { alert('Please select a supplier'); return; }
    if (items.length === 0) { alert('Please add at least one product'); return; }
    setIsSubmitting(true);
    try {
      const paid = parseFloat(payment.amount || 0);
      const payload = {
        ...header,
        total_amount: grandTotal,
        paid_amount: paid,
        due_amount: grandTotal - paid,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          tax_amount: i.tax_amount,
          total_amount: (i.quantity * i.unit_price) + i.tax_amount
        })),
        payment: { ...payment, amount: paid, payment_date: header.purchase_date }
      };
      await createPurchase(payload);
      navigate('/purchases');
    } catch (err) {
      alert('Failed to create purchase. Check console for details.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Create New Purchase</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Add stock items from your supplier and log payment</p>
        </div>
        <button className="btn-premium btn-light-premium" onClick={() => navigate('/purchases')}>
          <X size={18} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card-premium mb-4">
              <div className="card-body-premium row g-3">
                <div className="col-md-6">
                  <label className="form-label-premium">Supplier <span className="text-danger">*</span></label>
                  <select className="form-select form-control-premium" value={header.supplier_id}
                    onChange={e => setHeader({ ...header, supplier_id: e.target.value })} required>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Purchase Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control form-control-premium" value={header.purchase_date}
                    onChange={e => setHeader({ ...header, purchase_date: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Reference No.</label>
                  <input type="text" className="form-control form-control-premium" placeholder="e.g. PU-2024-001"
                    value={header.reference_no} onChange={e => setHeader({ ...header, reference_no: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Status</label>
                  <select className="form-select form-control-premium" value={header.status}
                    onChange={e => setHeader({ ...header, status: e.target.value })}>
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-premium mb-4">
              <div className="card-body-premium">
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded border border-light">
                  <Search className="text-muted me-2" size={20} />
                  <select className="form-select border-0 bg-transparent fw-medium" onChange={handleProductSelect}>
                    <option value="">Search or Select Product to add...</option>
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.item_name} (Purchase: ₹{p.purchase_price}) - Stock: {p.current_stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="table-responsive">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Item Information</th>
                        <th style={{ width: '12%' }}>Qty</th>
                        <th style={{ width: '18%' }}>Unit Cost (₹)</th>
                        <th style={{ width: '12%' }}>Tax (₹)</th>
                        <th className="text-end" style={{ width: '15%' }}>Line Total</th>
                        <th style={{ width: '5%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            <Box size={40} className="mb-2 opacity-50" />
                            <p className="mb-0">No items added. Select products above.</p>
                          </td>
                        </tr>
                      ) : items.map((item, i) => {
                        const lineTotal = (item.quantity * item.unit_price) + item.tax_amount;
                        return (
                          <tr key={i}>
                            <td><div className="fw-bold">{item.item_name}</div></td>
                            <td><input type="number" className="form-control form-control-sm text-center" value={item.quantity} min="1"
                              onChange={e => handleItemChange(i, 'quantity', e.target.value)} /></td>
                            <td><input type="number" className="form-control form-control-sm" value={item.unit_price}
                              onChange={e => handleItemChange(i, 'unit_price', e.target.value)} /></td>
                            <td><input type="number" className="form-control form-control-sm" value={item.tax_amount}
                              onChange={e => handleItemChange(i, 'tax_amount', e.target.value)} /></td>
                            <td className="text-end fw-bold">₹{lineTotal.toFixed(2)}</td>
                            <td className="text-end">
                              <button type="button" className="btn btn-sm text-danger px-1 bg-transparent border-0" onClick={() => removeItem(i)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="row mt-4 pt-3 border-top">
                  <div className="col-md-6 offset-md-6">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-medium">Purchase Total:</span>
                      <span className="fw-bold fs-5">₹{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card-premium position-sticky" style={{ top: '20px' }}>
              <div className="card-header-premium bg-light">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Payment Summary
                </h6>
              </div>
              <div className="card-body-premium">
                <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded mb-4 text-center">
                  <div className="text-primary fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Grand Total</div>
                  <div className="fs-2 fw-bolder text-primary">₹{grandTotal.toFixed(2)}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label-premium fw-bold text-dark">Amount Paying Now (₹)</label>
                  <input type="number" className="form-control form-control-premium fs-5 fw-bold text-success"
                    value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 p-2 rounded bg-light">
                  <span className="text-muted fw-bold">Balance Due:</span>
                  <span className={`fw-bold fs-5 ${dueAmount > 0 ? 'text-danger' : 'text-success'}`}>₹{dueAmount.toFixed(2)}</span>
                </div>

                <div className="mb-4">
                  <label className="form-label-premium">Payment Note</label>
                  <textarea className="form-control form-control-premium" rows="2" placeholder="e.g. Paid to supplier"
                    value={payment.note} onChange={e => setPayment({ ...payment, note: e.target.value })} />
                </div>

                <button type="submit" className="btn-premium btn-primary-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting}>
                  <Save size={20} />
                  {isSubmitting ? 'Processing...' : 'Save Purchase & Update Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
