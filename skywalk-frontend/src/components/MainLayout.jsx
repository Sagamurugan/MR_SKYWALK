// src/components/MainLayout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- IMPORT THE TOASTER
import Logo from './Logo';
import Footer from './Footer';
import ThemeToggle from './ThemeToggle';

const MainLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      {/* Toaster component for pop-up notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-notification',
          duration: 5000,
        }}
      />

      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo />
        </div>
        <nav>
          <ul>
            <li><NavLink to="/">Dashboard</NavLink></li>
            <li><NavLink to="/map">Map View</NavLink></li> 
            <li><NavLink to="/alerts">Alerts</NavLink></li>
            <li><NavLink to="/settings">Settings</NavLink></li>
          </ul>
        </nav>
        <div className="user-profile">
          <p>Saga Murugan S</p>
          <a href="/login">Logout</a>
        </div>
        <ThemeToggle />
      </aside>
      <div className="content-area">
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;