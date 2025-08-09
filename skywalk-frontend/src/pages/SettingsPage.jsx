// src/pages/SettingsPage.jsx
import React from 'react';

const SettingsPage = () => {
  return (
    <>
      <header><h1>Settings</h1></header>
      <div className="settings-layout">
        {/* Profile Section */}
        <div className="card">
          <h2>👤 Profile</h2>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" defaultValue="Saga Murugan S" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" defaultValue="saga.murugan@example.com" readOnly />
          </div>
          <button className="button-primary">Update Profile</button>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <h2>🔔 Notifications</h2>
          <div className="setting-item">
            <span>Email alerts for critical events</span>
            <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
          </div>
          <div className="setting-item">
            <span>Email alerts for warnings</span>
            <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
          </div>
          <div className="setting-item">
            <span>Push notifications (mobile)</span>
            <label className="switch"><input type="checkbox" disabled /><span className="slider"></span></label>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
