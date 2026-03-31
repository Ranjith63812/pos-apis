import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSales } from '../api/salesApi';
import { getProducts } from '../api/productApi';
import { createSalesReturn } from '../api/salesReturnApi';
import { LayoutDashboard, Save, X, Search, Trash2, Box } from 'lucide-react';

export default function NewSalesReturn() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [header, setHeader] = useState({
    sale_id: '',
    return_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    status: 'Return',
    other_charges: 0,
    discount_on_all: 0
  });

  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState({ amount: 0, note: '' });

  // Math Hook
  const subtotal = useMemo(() =>
    items.reduce((sum, i) => sum + (i.quantity * i.unit_price) - i.discount + i.tax_amount, 0), [items]);

  const grandTotal = useMemo(() => 
    subtotal + parseFloat(header.other_charges || 0) - parseFloat(header.discount_on_all || 0),
    [subtotal, header.other_charges, header.discount_on_all]);

  const dueAmount = grandTotal - parseFloat(payment.amount || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, prodRes] = await Promise.all([getSales(), getProducts()]);
        setSales(salesRes.data || []);
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
        unit_price: product.sales_price || 0,
        discount: 0,
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
    if (!header.sale_id) { alert('Please select an Original Invoice'); return; }
    if (items.length === 0) { alert('Please add at least one product to return'); return; }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...header,
        other_charges: parseFloat(header.other_charges || 0),
        discount_on_all: parseFloat(header.discount_on_all || 0),
        items: items.map(i => ({
          ...i,
          total_amount: (i.quantity * i.unit_price) - i.discount + i.tax_amount
        })),
        payment: { 
          amount: parseFloat(payment.amount || 0), 
          payment_date: header.return_date, 
          payment_type_id: 1, 
          note: payment.note 
        }
      };
      await createSalesReturn(payload);
      navigate('/sales-returns');
    } catch (err) {
      alert('Failed to process return. Check console.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <section className="content-header p-3 pb-0 d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 fs-3 fw-normal" style={{ color: '#333' }}>
          New Sales Return <small className="text-muted fs-6 ms-2">Process Customer Return</small>
        </h1>
      </section>

      <section className="content px-3 pb-5">
        <form onSubmit={handleSubmit}>
          {/* Header Box */}
          <div className="box box-primary rounded-0 shadow-sm mb-4">
            <div className="box-body p-4 bg-white row g-3">
              <div className="col-md-4">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Original Invoice *</label>
                <select className="form-select rounded-0" style={{ fontSize: '14px' }}
                  value={header.sale_id} onChange={e => setHeader({ ...header, sale_id: e.target.value })} required>
                  <option value="">- Select Invoice -</option>
                  {sales.map(s => <option key={s.sale_id} value={s.sale_id}>{s.sales_code} - {s.customer_name}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Return Date *</label>
                <input type="date" className="form-control rounded-0" style={{ fontSize: '14px' }}
                  value={header.return_date} onChange={e => setHeader({ ...header, return_date: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Reference No.</label>
                <input type="text" className="form-control rounded-0" style={{ fontSize: '14px' }} placeholder="e.g. RET-001"
                  value={header.reference_no} onChange={e => setHeader({ ...header, reference_no: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="fw-bold mb-1" style={{ fontSize: '13px' }}>Status</label>
                <select className="form-select rounded-0" style={{ fontSize: '14px' }}
                  value={header.status} onChange={e => setHeader({ ...header, status: e.target.value })}>
                  <option value="Return">Return (Completed)</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Box */}
          <div className="box box-primary rounded-0 shadow-sm mb-4">
            <div className="box-body p-4 bg-white">
              <div className="row mb-4">
                <div className="col-md-8 offset-md-2">
                  <div className="input-group">
                    <span className="input-group-text bg-white rounded-0"><Search size={16} className="text-primary"/></span>
                    <select className="form-select rounded-0 fw-bold border-start-0 ps-0" onChange={handleProductSelect} style={{ fontSize: '15px' }}>
                      <option value="">Search Item Name or scan barcode...</option>
                      {products.map(p => (
                        <option key={p.product_id} value={p.product_id}>{p.item_name} - {p.current_stock} in stock</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead style={{ backgroundColor: '#3c8dbc', color: 'white' }}>
                    <tr>
                      <th>Item Name</th>
                      <th style={{ width: '10%' }}>Return Qty</th>
                      <th style={{ width: '15%' }}>Price (₹)</th>
                      <th style={{ width: '12%' }}>Discount (₹)</th>
                      <th style={{ width: '12%' }}>Tax (₹)</th>
                      <th className="text-end" style={{ width: '15%' }}>Total</th>
                      <th style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-4 text-muted"><Box size={30} className="mb-2 opacity-50 d-block mx-auto" />Please select products to return</td></tr>
                    ) : items.map((item, i) => {
                      const lineTotal = (item.quantity * item.unit_price) - item.discount + item.tax_amount;
                      return (
                        <tr key={i} className="align-middle">
                          <td className="fw-bold text-primary">{item.item_name}</td>
                          <td><input type="number" className="form-control form-control-sm rounded-0 text-center" value={item.quantity} min="1"
                            onChange={e => handleItemChange(i, 'quantity', e.target.value)} /></td>
                          <td><input type="number" className="form-control form-control-sm rounded-0" value={item.unit_price}
                            onChange={e => handleItemChange(i, 'unit_price', e.target.value)} /></td>
                          <td><input type="number" className="form-control form-control-sm rounded-0" value={item.discount}
                            onChange={e => handleItemChange(i, 'discount', e.target.value)} /></td>
                          <td><input type="number" className="form-control form-control-sm rounded-0" value={item.tax_amount}
                            onChange={e => handleItemChange(i, 'tax_amount', e.target.value)} /></td>
                          <td className="text-end fw-bold">₹ {lineTotal.toFixed(2)}</td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-danger rounded-0" onClick={() => removeItem(i)}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* Footer & Math */}
          <div className="row">
            <div className="col-md-6">
              <div className="box box-primary rounded-0 shadow-sm mb-4 h-100">
                <div className="box-header with-border">
                  <h3 className="box-title">Return Extras & Note</h3>
                </div>
                <div className="box-body p-4 bg-white">
                  <div className="mb-3 row">
                    <label className="col-sm-4 col-form-label fw-bold" style={{ fontSize: '13px' }}>Return Note</label>
                    <div className="col-sm-8">
                       <textarea className="form-control rounded-0" rows="3" placeholder="Reason for return..."
                         value={payment.note} onChange={e => setPayment({ ...payment, note: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="box box-primary rounded-0 shadow-sm mb-4">
                <div className="box-header with-border">
                  <h3 className="box-title">Return Summary</h3>
                </div>
                <div className="box-body p-4 bg-white">
                  <table className="table table-sm borderless mb-0">
                    <tbody>
                      <tr>
                        <th className="w-50 align-middle">Subtotal</th>
                        <td className="text-end fw-bold">₹ {subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th className="align-middle">Other Charges (+)</th>
                        <td className="text-end">
                           <input type="number" className="form-control form-control-sm rounded-0 w-75 float-end text-end" 
                            value={header.other_charges} onChange={e => setHeader({ ...header, other_charges: e.target.value })} />
                        </td>
                      </tr>
                      <tr>
                        <th className="align-middle">Discount on All (-)</th>
                        <td className="text-end">
                           <input type="number" className="form-control form-control-sm rounded-0 w-75 float-end text-end" 
                            value={header.discount_on_all} onChange={e => setHeader({ ...header, discount_on_all: e.target.value })} />
                        </td>
                      </tr>
                      <tr className="bg-light">
                        <th className="fs-5 text-success">Grand Total</th>
                        <td className="text-end fs-5 fw-bolder text-success">₹ {grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <hr className="my-3"/>
                  
                  <div className="mb-3 row">
                    <label className="col-sm-6 col-form-label fw-bold text-danger">Refund Amount Paid</label>
                    <div className="col-sm-6">
                       <input type="number" className="form-control form-control-lg rounded-0 text-end text-danger fw-bold" 
                         value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                     <span className="fw-bold">Balance Due:</span>
                     <span className="fw-bold">₹ {dueAmount.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 pt-3 border-top text-center">
                    <button type="submit" className="btn btn-success rounded-0 px-4 py-2 me-2" disabled={isSubmitting}>
                      <Save size={16} className="me-2"/> {isSubmitting ? 'Saving...' : 'Save Return'}
                    </button>
                    <button type="button" className="btn btn-warning rounded-0 px-4 py-2" onClick={() => navigate('/sales-returns')}>
                      <X size={16} className="me-2"/> Close
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </form>
      </section>
    </>
  );
}
