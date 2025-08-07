import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function WorkerApp({ workerName = 'Worker 1' }) {
  const [route, setRoute] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    fetch(`/routes/${encodeURIComponent(workerName)}`)
      .then(res => res.json())
      .then(data => {
        setRoute(data);
        const initTasks = data.map(client => ({
          clientId: client.id,
          lat: client.lat,
          lng: client.lng,
          actionsRemaining: client.actions,
          photoLogs: []
        }));
        setTasks(initTasks);
      });
  }, [workerName]);

  const clockIn = () => {
    setClockedIn(true);
    setStartTime(new Date());
  };
  const clockOut = () => {
    setClockedIn(false);
    setEndTime(new Date());
  };

  const handlePhoto = (taskIndex) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const updated = [...tasks];
        updated[taskIndex].photoLogs.push({
          timestamp: new Date().toISOString(),
          url: reader.result
        });
        updated[taskIndex].actionsRemaining -= 1;
        setTasks(updated);
        fetch(`/clients/${updated[taskIndex].clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: reader.result })
        });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button onClick={clockIn} disabled={clockedIn}>Clock In</button>
          <button onClick={clockOut} disabled={!clockedIn} style={{ marginLeft: '1rem' }}>Clock Out</button>
        </div>
        <div>
          {clockedIn && <span>Started: {startTime?.toLocaleTimeString()}</span>}
          {!clockedIn && endTime && <span>Ended: {endTime.toLocaleTimeString()}</span>}
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '30%', padding: '1rem', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
          <h2>Tasks for {workerName}</h2>
          {tasks.map((t, i) => (
            <div key={t.clientId} style={{ marginBottom: '1rem' }}>
              <div><strong>Client #{t.clientId}</strong></div>
              <div>Actions remaining: {t.actionsRemaining}</div>
              {t.actionsRemaining > 0 && (
                <button onClick={() => handlePhoto(i)}>Take Photo</button>
              )}
              <ul>
                {t.photoLogs.map((log, j) => (
                  <li key={j} style={{ fontSize: '0.8rem' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        <main style={{ flex: 1 }}>
          <MapContainer center={[33.605, -111.935]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {route.length > 0 && (
              <Polyline positions={route.map(c => [c.lat, c.lng])} color="purple" />
            )}
            {route.map(c => (
              <Marker key={c.id} position={[c.lat, c.lng]} />
            ))}
          </MapContainer>
        </main>
      </div>
    </div>
);
}
