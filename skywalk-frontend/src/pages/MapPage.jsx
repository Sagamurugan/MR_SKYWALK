
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import SensorDetailPanel from '../components/SensorDetailPanel';

const getStatusClass = (status) => {
  switch (status) {
    case 'Critical': return 'status-critical';
    case 'Warning': return 'status-warning';
    default: return 'status-operational';
  }
};

const SensorNode = ({ sensor, onClick }) => (
  <div className="sensor-node-wrapper" style={{ left: sensor.position.x, top: sensor.position.y }}>
    <div className={`sensor-node ${getStatusClass(sensor.status)}`} onClick={() => onClick(sensor)}></div>
    <div className="sensor-tooltip">
      <strong>ID:</strong> {sensor.id}<br/>
      <strong>Type:</strong> {sensor.type}
    </div>
  </div>
);

const MapPage = () => {
  const [sensors, setSensors] = useState([]); // State to hold sensor data from Firestore
  const [selectedSensor, setSelectedSensor] = useState(null);

  // useEffect to set up the real-time listener for the sensors collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sensors'), (snapshot) => {
      const sensorsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setSensors(sensorsData);
    });

    
    return () => unsubscribe();
  }, []);

  const handleNodeClick = (sensor) => {
    setSelectedSensor(sensor);
  };

  const handleClosePanel = () => {
    setSelectedSensor(null);
  };

  return (
    <>
      <header>
        <h1>Sensor Map View</h1>
      </header>
      <div className="card">
        <div className="map-container">
          <svg width="100%" height="200" className="skywalk-svg">
            <path d="M 50 100 H 950" strokeWidth="60" className="walkway-path" />
            <rect x="150" y="130" width="20" height="70" className="pillar" />
            <rect x="480" y="130" width="20" height="70" className="pillar" />
            <rect x="810" y="130" width="20" height="70" className="pillar" />
          </svg>
          {/* Render the sensor nodes from the live data */}
          {sensors.map(sensor => <SensorNode key={sensor.id} sensor={sensor} onClick={handleNodeClick} />)}
        </div>
      </div>
      <SensorDetailPanel sensor={selectedSensor} onClose={handleClosePanel} />
    </>
  );
};

export default MapPage;