import React from 'react';
import ReactDOM from 'react-dom/client';
import WorkerApp from './WorkerApp';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WorkerApp />
  </React.StrictMode>
);
