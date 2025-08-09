// src/components/SensorDetailPanel.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';

// --- FAKE DATA for the mini-chart ---
const miniChartData = {
  labels: ['-30m', '-25m', '-20m', '-15m', '-10m', '-5m', 'now'],
  datasets: [
    {
      label: 'History',
      data: [0.11, 0.13, 0.12, 0.15, 0.14, 0.18, 0.12], // This would be dynamic in a real app
      borderColor: '#3b82f6',
      tension: 0.4,
    },
  ],
};

const miniChartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

const SensorDetailPanel = ({ sensor, onClose }) => {
  if (!sensor) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Critical': return 'status-critical';
      case 'Warning': return 'status-warning';
      default: return 'status-operational';
    }
  };

  return (
    <>
      <div className="details-panel-overlay" onClick={onClose}></div>
      <div className="details-panel">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Sensor Details</h2>
        <div className="detail-item">
          <span>Sensor ID</span>
          <strong>{sensor.id}</strong>
        </div>
        <div className="detail-item">
          <span>Sensor Type</span>
          <strong>{sensor.type}</strong>
        </div>
        <div className="detail-item">
          <span>Status</span>
          <strong className={getStatusClass(sensor.status)}>{sensor.status}</strong>
        </div>
        <div className="mini-chart-container">
          <h3>Recent Activity</h3>
          <Line options={miniChartOptions} data={miniChartData} />
        </div>
        <div className="maintenance-log">
          <h3>Maintenance Log</h3>
          <ul>
            <li>Checked calibration - OK (2025-07-15)</li>
            <li>Replaced battery - OK (2025-06-01)</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SensorDetailPanel;
