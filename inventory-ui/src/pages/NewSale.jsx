import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../api/customerApi';
import { getProducts } from '../api/productApi';
import { createSale } from '../api/salesApi';
import { Plus, Trash2, Save, X, Search, CreditCard, Box } from 'lucide-react';

export default function NewSale() {
  const navigate = useNavigate();
  
  // Base Data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [header, setHeader] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    status: 'Final'
  });
  
  const [items, setItems] = useState([]);
  
  const [totals, setTotals] = useState({
    other_charges: 0,
    discount_on_all: 0,
  });

  const [payment, setPayment] = useState({
    amount: 0,
    payment_type_id: 1, // Default to cash/primary payment
    note: ''
  });

  // Calculate dynamic totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + ((item.quantity * item.unit_price) - item.discount + item.tax_amount);
    }, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return subtotal + parseFloat(totals.other_charges || 0) - parseFloat(totals.discount_on_all || 0);
  }, [subtotal, totals]);

  const dueAmount = useMemo(() => {
    return grandTotal - parseFloat(payment.amount || 0);
  }, [grandTotal, payment.amount]);

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          getCustomers(),
          getProducts()
        ]);
        setCustomers(custRes.data || []);
        
        // Ensure products array exists
        const prods = prodRes.data?.data || prodRes.data || [];
        setProducts(prods);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    if (!productId) return;
    
    // Check if already in cart
    if (items.find(i => i.product_id === productId)) {
      e.target.value = ''; // Reset select
      return; 
    }

    const product = products.find(p => p.product_id === productId);
    if (product) {
      setItems([...items, {
        product_id: product.product_id,
        item_name: product.item_name,
        quantity: 1,
        unit_price: product.price || 0,
        discount: 0,
        tax_amount: 0,
        current_stock: product.current_stock || 0
      }]);
    }
    e.target.value = ''; // Reset select
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.customer_id) { alert('Please select a customer'); return; }
    if (items.length === 0) { alert('Please add at least one product'); return; }
    
    // Check stock
    const insufficientStock = items.find(i => i.quantity > i.current_stock);
    if (insufficientStock) {
      alert(`Warning: Insufficient stock for ${insufficientStock.item_name}. Available: ${insufficientStock.current_stock}`);
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      ...header,
      other_charges: parseFloat(totals.other_charges || 0),
      discount_on_all: parseFloat(totals.discount_on_all || 0),
      items: items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount: i.discount,
        tax_amount: i.tax_amount
      })),
      payment: {
        ...payment,
        amount: parseFloat(payment.amount || 0),
        payment_date: header.sale_date
      }
    };

    try {
      await createSale(payload);
      navigate('/sales');
    } catch (err) {
      alert('Failed to create sale. Check the console for details.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary" /></div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Create New Sale</h4>
          <p className="text-muted mb-0" style={{fontSize: '0.9rem'}}>Add items, apply discounts, and process payment</p>
        </div>
        <div>
          <button className="btn-premium btn-light-premium me-2" onClick={() => navigate('/sales')}>
            <X size={18} /> Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Main Left Column (Items and Pricing) */}
          <div className="col-lg-8">
            
            {/* Header Details Card */}
            <div className="card-premium mb-4">
              <div className="card-body-premium row g-3">
                <div className="col-md-6">
                  <label className="form-label-premium">Customer <span className="text-danger">*</span></label>
                  <select 
                    className="form-select form-control-premium text-muted" 
                    value={header.customer_id}
                    onChange={e => setHeader({...header, customer_id: e.target.value})}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.mobile})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Sale Date <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    className="form-control form-control-premium" 
                    value={header.sale_date}
                    onChange={e => setHeader({...header, sale_date: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Reference No</label>
                  <input 
                    type="text" 
                    className="form-control form-control-premium" 
                    placeholder="e.g. SL-2023-001"
                    value={header.reference_no}
                    onChange={e => setHeader({...header, reference_no: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-premium">Status</label>
                  <select 
                    className="form-select form-control-premium text-muted"
                    value={header.status}
                    onChange={e => setHeader({...header, status: e.target.value})}
                  >
                    <option value="Final">Final</option>
                    <option value="Draft">Draft</option>
                    <option value="Quotation">Quotation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cart Table Card */}
            <div className="card-premium mb-4">
              <div className="card-body-premium">
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded border border-light">
                  <Search className="text-muted me-2" size={20} />
                  <select className="form-select border-0 bg-transparent fw-medium" onChange={handleProductSelect}>
                    <option value="">Search or Select Product to add...</option>
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.item_name} (₹{p.price}) - Stock: {p.current_stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="table-responsive">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Item Information</th>
                        <th style={{width: '12%'}}>Qty</th>
                        <th style={{width: '15%'}}>Unit Price</th>
                        <th style={{width: '12%'}}>Discount</th>
                        <th style={{width: '12%'}}>Tax</th>
                        <th className="text-end" style={{width: '15%'}}>Subtotal</th>
                        <th style={{width: '5%'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <Box size={40} className="mb-2 opacity-50" />
                            <p className="mb-0">Your cart is empty. Add a product above.</p>
                          </td>
                        </tr>
                      ) : items.map((item, index) => {
                        const itemSub = (item.quantity * item.unit_price) - item.discount + item.tax_amount;
                        return (
                          <tr key={index}>
                            <td>
                              <div className="fw-bold">{item.item_name}</div>
                              <small className="text-muted">Stock: {item.current_stock}</small>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm text-center" 
                                value={item.quantity} min="1" max={item.current_stock}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                value={item.tax_amount}
                                onChange={(e) => handleItemChange(index, 'tax_amount', e.target.value)}
                              />
                            </td>
                            <td className="text-end fw-bold">₹{itemSub.toFixed(2)}</td>
                            <td className="text-end">
                              <button type="button" className="btn btn-sm text-danger px-1 bg-transparent border-0" onClick={() => removeItem(index)}>
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
                      <span className="text-muted fw-medium">Order Subtotal:</span>
                      <span className="fw-bold fs-5">₹{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column (Totals and Payment) */}
          <div className="col-lg-4">
            <div className="card-premium position-sticky" style={{top: '20px'}}>
              <div className="card-header-premium bg-light">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <CreditCard size={18} className="text-primary"/> Payment Summary
                </h6>
              </div>
              <div className="card-body-premium">
                
                <div className="mb-3">
                  <label className="form-label-premium">Order Discount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-premium" 
                    value={totals.discount_on_all}
                    onChange={e => setTotals({...totals, discount_on_all: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label-premium">Shipping / Other Charges (₹)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-premium" 
                    value={totals.other_charges}
                    onChange={e => setTotals({...totals, other_charges: e.target.value})}
                  />
                </div>

                <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded mb-4 text-center">
                  <div className="text-primary fw-bold text-uppercase" style={{fontSize: '0.8rem', letterSpacing: '1px'}}>Grand Total</div>
                  <div className="fs-2 fw-bolder text-primary">₹{grandTotal.toFixed(2)}</div>
                </div>

                <hr className="my-4 text-muted" />

                <div className="mb-3">
                  <label className="form-label-premium fw-bold text-dark">Amount Paying Now (₹)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-premium fs-5 fw-bold text-success" 
                    value={payment.amount}
                    onChange={e => setPayment({...payment, amount: e.target.value})}
                  />
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4 p-2 rounded bg-light">
                  <span className="text-muted fw-bold">Balance Due:</span>
                  <span className={`fw-bold fs-5 ${dueAmount > 0 ? 'text-danger' : 'text-success'}`}>
                    ₹{dueAmount.toFixed(2)}
                  </span>
                </div>

                <div className="mb-4">
                  <label className="form-label-premium">Payment Note</label>
                  <textarea 
                    className="form-control form-control-premium" 
                    rows="2" 
                    placeholder="e.g. Paid in cash"
                    value={payment.note}
                    onChange={e => setPayment({...payment, note: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-premium btn-primary-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting}
                >
                  <Save size={20} />
                  {isSubmitting ? 'Processing...' : 'Complete Sale & Submit'}
                </button>

              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
