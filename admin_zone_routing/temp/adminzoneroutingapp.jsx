// AdminZoneRoutingApp.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const sampleZones = [
  {
    id: 1,
    name: "Zone 1",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-111.924, 33.6],
          [-111.920, 33.6],
          [-111.920, 33.602],
          [-111.924, 33.602],
          [-111.924, 33.6],
        ],
      ],
    },
    actions: 120,
    assignedTo: null,
  },
  {
    id: 2,
    name: "Zone 2",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-111.920, 33.6],
          [-111.916, 33.6],
          [-111.916, 33.602],
          [-111.920, 33.602],
          [-111.920, 33.6],
        ],
      ],
    },
    actions: 60,
    assignedTo: null,
  },
];

export default function AdminZoneRoutingApp() {
  const [zones, setZones] = useState(sampleZones);
  const [selectedWorker, setSelectedWorker] = useState("Worker 1");

  const assignZone = (zoneId) => {
    const updated = zones.map((z) =>
      z.id === zoneId ? { ...z, assignedTo: selectedWorker } : z
    );
    setZones(updated);
  };

  const styleZone = (zone) => {
    const colors = {
      null: 'gray',
      'Worker 1': 'blue',
      'Worker 2': 'green',
    };
    return {
      color: colors[zone.assignedTo],
      weight: 2,
      fillOpacity: 0.4,
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-2/3 h-1/2 md:h-full">
        <MapContainer center={[33.601, -111.922]} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {zones.map((zone) => (
            <GeoJSON
              key={zone.id}
              data={zone.geometry}
              eventHandlers={{
                click: () => assignZone(zone.id),
              }}
              style={() => styleZone(zone)}
            />
          ))}
        </MapContainer>
      </div>
      <div className="w-full md:w-1/3 p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-2">Assign Zones</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Worker:</label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="border p-1 w-full"
          >
            <option>Worker 1</option>
            <option>Worker 2</option>
          </select>
        </div>
        <h3 className="text-lg font-semibold mb-2">Zone Summary</h3>
        <ul>
          {zones.map((z) => (
            <li key={z.id} className="mb-2">
              <strong>{z.name}</strong> — {z.actions} actions — Assigned to: {z.assignedTo || 'None'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
