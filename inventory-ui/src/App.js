import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Countries from './pages/Countries';
import States from './pages/States';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/states" element={<States />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
