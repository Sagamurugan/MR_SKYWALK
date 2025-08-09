// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { doc, onSnapshot } from 'firebase/firestore'; // <-- Import Firestore functions
import { db } from '../firebase'; // <-- Import your db instance

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- FAKE HISTORICAL DATA (we will make this real later) ---
const historicalData = {
  labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
  datasets: [
    { label: 'Vibration (g)', data: [0.10, 0.11, 0.15, 0.12, 0.13, 0.18, 0.14], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.5)', yAxisID: 'y' },
    { label: 'Load (kg)', data: [200, 220, 210, 250, 260, 300, 280], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.5)', yAxisID: 'y1' },
    { label: 'Temperature (°C)', data: [30, 30.5, 31, 31.2, 31.5, 31.8, 31.5], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.5)', yAxisID: 'y1' },
  ]
};
const chartOptions = {
  responsive: true, interaction: { mode: 'index', intersect: false }, stacked: false,
  plugins: { legend: { labels: { color: '#9ca3af' } } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Vibration (g)', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Load / Temp', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { drawOnChartArea: false } },
  }
};

const DataCard = ({ title, value, unit, icon }) => (
  <div className="data-card">
    <div className="icon">{icon}</div>
    <div className="data-text">
      <h3>{title}</h3>
      <p>{value !== undefined ? value : '...'} <span>{unit}</span></p>
    </div>
  </div>
);

const DashboardPage = () => {
  // State to hold the live sensor data
  const [liveData, setLiveData] = useState({});

  // useEffect to set up the real-time listener
  useEffect(() => {
    const docRef = doc(db, 'live-data', 'latest');

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setLiveData(doc.data());
      } else {
        console.log("No such document!");
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const simulateCriticalAlert = () => {
    toast.error('Critical Alert: High vibration detected on Sector 4.');
  };

  return (
    <>
      <header>
        <h1>Dashboard Overview</h1>
        <div className="header-actions">
          <button onClick={simulateCriticalAlert} className="button-secondary">
            Simulate Critical Alert
          </button>
          <div className="status-indicator">
            System Status: <span className="status-ok">{liveData.status || '...'}</span>
          </div>
        </div>
      </header>
      <section className="live-data-grid">
        <DataCard title="Live Vibration" value={liveData.vibration} unit="g" icon="📳" />
        <DataCard title="Current Load" value={liveData.load} unit="kg" icon="⚖️" />
        <DataCard title="Crowd Count" value={liveData.count} unit="people" icon="👨‍👩‍👧‍👦" />
        <DataCard title="Temperature" value={liveData.temperature} unit="°C" icon="🌡️" />
        <DataCard title="Humidity" value={liveData.humidity} unit="%" icon="💧" />
      </section>
      <section className="card">
        <h2>Sensor History</h2>
        <Line options={chartOptions} data={historicalData} />
      </section>
    </>
  );
};

export default DashboardPage;

