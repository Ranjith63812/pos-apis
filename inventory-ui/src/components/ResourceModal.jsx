import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * A highly reusable AdminLTE-styled modal for CRUD operations.
 * 
 * @param {boolean} show - Whether the modal is visible.
 * @param {string} title - Modal title.
 * @param {object} item - The current item being edited (null for new).
 * @param {array} fields - List of fields [{ key, label, type, placeholder, required, options }].
 * @param {function} onSave - Callback function on save(data).
 * @param {function} onCancel - Callback function on cancel.
 */
export default function ResourceModal({ show, title, item, fields, onSave, onCancel }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Initialize with default values
      const initial = {};
      fields.forEach(f => {
        initial[f.key] = f.defaultValue !== undefined ? f.defaultValue : '';
      });
      setFormData(initial);
    }
  }, [item, show, fields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : 
              type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save record.');
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg rounded-0">
        <div className="modal-content rounded-0 border-0 shadow-lg">
          {/* AdminLTE Box Style Header */}
          <div className="modal-header rounded-0 py-2 border-0" style={{ backgroundColor: '#3c8dbc', color: '#fff' }}>
            <h5 className="modal-title fs-6 fw-bold">{item ? `Edit ${title}` : `New ${title}`}</h5>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-light">
              <div className="row g-3">
                {fields.map(field => (
                  <div key={field.key} className={field.fullWidth ? 'col-12' : 'col-md-6'}>
                    <label className="form-label mb-1 fw-bold text-muted small">{field.label} {field.required && <span className="text-danger">*</span>}</label>
                    
                    {field.type === 'select' ? (
                      <select 
                        name={field.key}
                        className="form-select form-select-sm rounded-0 shadow-none border-secondary-subtle"
                        value={formData[field.key] || ''}
                        onChange={handleChange}
                        required={field.required}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.key}
                        className="form-control form-control-sm rounded-0 shadow-none border-secondary-subtle"
                        placeholder={field.placeholder}
                        rows={3}
                        value={formData[field.key] || ''}
                        onChange={handleChange}
                        required={field.required}
                      ></textarea>
                    ) : (
                      <input 
                        type={field.type || 'text'}
                        name={field.key}
                        className="form-control form-control-sm rounded-0 shadow-none border-secondary-subtle"
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={handleChange}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer border-0 p-3 bg-white d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-default btn-sm rounded-0 border text-muted px-4" 
                onClick={onCancel}
              >
                Close
              </button>
              <button 
                type="submit" 
                className="btn btn-info btn-sm rounded-0 text-white px-4 d-flex align-items-center gap-1 shadow-sm"
                disabled={loading}
                style={{ backgroundColor: '#00c0ef', borderColor: '#00acd6' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm mr-1"></span>
                ) : (
                  <Save size={14} />
                )}
                {item ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
