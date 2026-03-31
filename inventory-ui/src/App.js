import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import NewPurchase from './pages/NewPurchase';
import PurchaseReturns from './pages/PurchaseReturns';
import NewPurchaseReturn from './pages/NewPurchaseReturn';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import SalesReturns from './pages/SalesReturns';
import NewSalesReturn from './pages/NewSalesReturn';
import Expenses from './pages/Expenses';
import Countries from './pages/Countries';
import States from './pages/States';
import Brands from './pages/Brands';
import Taxes from './pages/Taxes';
import Units from './pages/Units';
import ProductForm from './pages/ProductForm';
import Login from './pages/Login';


function AppContent() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isLoginPage = location.pathname === '/login';

  // Auth Guard: If not logged in, force Login page
  if (!isLoggedIn && !isLoginPage) {
    return <Login />;
  }

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/new" element={<NewPurchase />} />
            <Route path="/purchase-returns" element={<PurchaseReturns />} />
            <Route path="/purchase-returns/new" element={<NewPurchaseReturn />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/new" element={<NewSale />} />
            <Route path="/sales-returns" element={<SalesReturns />} />
            <Route path="/sales-returns/new" element={<NewSalesReturn />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/states" element={<States />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/units" element={<Units />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
