import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const zoneColors = { null: 'gray', 'Worker 1': 'blue', 'Worker 2': 'green' };

export default function AdminZoneRoutingApp() {
  const [zones, setZones] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('Worker 1');

  useEffect(() => {
    fetch('/zones')
      .then(res => res.json())
      .then(data => {
        const arr = Object.entries(data).map(([name, info]) => ({ name, worker: info.worker }));
        setZones(arr);
      });
  }, []);

  useEffect(() => {
    fetch('/clients')
      .then(res => res.json())
      .then(data => setClients(data));
  }, []);

  const assignZone = (zoneName) => {
    fetch('/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone: zoneName, worker: selectedWorker }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.status === 'ok') {
          setZones(zones.map(z => z.name === zoneName ? { ...z, worker: selectedWorker } : z));
        }
      });
  };

  const updateClientInfo = (id, field, value) => {
    fetch(`/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    }).then(() => {
      setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
    });
  };

  const styleZone = (zone) => ({
    color: zoneColors[zone.worker] || 'gray',
    weight: 2,
    fillOpacity: 0.3
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '25%', padding: '1rem', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
        <h2>Assign Zones</h2>
        <label>Select Worker:</label>
        <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
          <option>Worker 1</option>
          <option>Worker 2</option>
        </select>
        <h3>Zone Summary</h3>
        <ul>
          {zones.map(z => (
            <li key={z.name}>
              <strong>{z.name}</strong> — Assigned to: {z.worker || 'None'}
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1 }}>
        <MapContainer center={[33.6, -111.92]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {zones.map((z, idx) => (
            <GeoJSON key={idx} data={z.geometry || z.geojson} style={() => styleZone(z)} eventHandlers={{ click: () => assignZone(z.name) }} />
          ))}
          {clients.map(client => (
            <Marker key={client.id} position={[client.lat, client.lng]}>
              <Popup>
                <div>
                  <div><strong>Client #{client.id}</strong></div>
                  <div>Trash bins: {client.trash_bins}</div>
                  <div>Recycle bins: {client.recycle_bins}</div>
                  <div>Actions: {client.actions}</div>
                  <div>Monthly cost: ${client.monthly_cost}</div>
                  {client.firstService && <div style={{ color: 'red' }}>First time service!</div>}
                  <textarea value={client.instructions} onChange={e => updateClientInfo(client.id, 'instructions', e.target.value)} placeholder="Bin location instructions" />
                  {!client.photoUrl &&
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = () => updateClientInfo(client.id, 'photoUrl', reader.result);
                      reader.readAsDataURL(file);
                    }} />
                  }
                  {client.photoUrl && <img src={client.photoUrl} alt="Bin location" style={{ width: '100%' }} />}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
