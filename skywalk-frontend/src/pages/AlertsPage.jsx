// src/pages/AlertsPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const getLevelClass = (level) => {
  switch (level) {
    case 'Critical': return 'level-critical';
    case 'Warning': return 'level-warning';
    default: return 'level-info';
  }
};

const AlertItem = ({ level, message, time }) => (
  <div className={`alert-item ${getLevelClass(level)}`}>
    <span className="alert-level">{level}</span>
    <p className="alert-message">{message}</p>
    <span className="alert-time">{time}</span>
  </div>
);

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alertsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alertsData.push({
          id: doc.id,
          ...data,
          // Format the Firestore timestamp to a readable string
          time: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'
        });
      });
      setAlerts(alertsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <header>
        <h1>System Alerts</h1>
      </header>
      <div className="card">
        <div className="alert-list">
          {alerts.length > 0 ? (
            alerts.map(alert => <AlertItem key={alert.id} {...alert} />)
          ) : (
            <p>No alerts to display.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertsPage;

