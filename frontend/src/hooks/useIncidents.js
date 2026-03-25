import { useState } from 'react';

export default function useIncidents() {
  const [incidents, setIncidents] = useState({});

  const getStatus = (vehicleId) => incidents[vehicleId] || 'pending';

  const setStatus = (vehicleId, status) => {
    setIncidents(prev => ({ ...prev, [vehicleId]: status }));
  };

  return { getStatus, setStatus };
}