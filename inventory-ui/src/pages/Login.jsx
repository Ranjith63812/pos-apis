import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShoppingBag } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/sales'); // Or dashboard
    } else {
      alert('Invalid credentials');
    }
  };

  const autoFill = () => {
    setUsername('admin');
    setPassword('123456');
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* Logo Area */}
        <div className="login-logo text-center mb-4">
          <div className="d-flex align-items-center justify-content-center">
            <div className="bg-primary rounded px-2 py-1 me-2 d-inline-flex align-items-center justify-content-center">
              <ShoppingBag color="white" size={28} />
            </div>
            <h2 className="mb-0 text-white" style={{ fontWeight: 800, textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontSize: '2rem' }}>
              Ultimate<br/>
              <span className="text-danger" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '2.5rem', lineHeight: '0.8', display: 'block' }}>Inventory</span>
            </h2>
          </div>
          <div className="text-white mt-1 fw-bold fs-5" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>with POS</div>
        </div>

        {/* Main Card */}
        <div className="card shadow-sm border-0 rounded-0 mb-3">
          <div className="card-body p-4 text-center">
            <p className="login-box-msg text-muted mb-4">Sign in to start your session</p>

            <form onSubmit={handleLogin}>
              <div className="input-group mb-3 position-relative">
                <input 
                  type="text" 
                  className="form-control rounded-0" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <div className="position-absolute text-muted" style={{ right: '10px', top: '8px', zIndex: 10 }}>
                  <User size={18} />
                </div>
              </div>

              <div className="input-group mb-3 position-relative">
                <input 
                  type="password" 
                  className="form-control rounded-0" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <div className="position-absolute text-muted" style={{ right: '10px', top: '8px', zIndex: 10 }}>
                  <Lock size={18} />
                </div>
              </div>

              <div className="row align-items-center">
                <div className="col-7 text-start">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="remember" />
                    <label className="form-check-label text-muted" htmlFor="remember" style={{fontSize: '0.9rem'}}>Remember Me</label>
                  </div>
                  <div className="mt-2">
                    <a href="#" className="text-info text-decoration-none" style={{fontSize: '0.85rem'}}>I forgot my password</a>
                  </div>
                </div>
                <div className="col-5">
                  <button type="submit" className="btn btn-primary w-100 rounded-0" style={{ backgroundColor: '#3c8dbc', borderColor: '#367fa9' }}>Sign In</button>
                  <div className="text-end mt-2">
                    <small className="text-muted" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>Version 2.4</small>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Helper Card */}
        <div className="card shadow-sm border-0 rounded-0">
          <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
            <h6 className="fw-bold mb-0">Click to Start Session!</h6>
          </div>
          <div className="card-body p-3">
            <table className="table table-bordered mb-0 text-center align-middle" style={{fontSize: '0.9rem'}}>
              <tbody>
                <tr>
                  <td>admin</td>
                  <td>123456</td>
                  <td>
                    <button type="button" className="btn btn-info btn-sm rounded-0 text-white w-100" onClick={autoFill}>Apply</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
