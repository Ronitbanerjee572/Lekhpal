import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    const verify = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
        await axios.get(`${apiUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuthorized(true);
      } catch (err) {
        localStorage.removeItem('token');
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) {
    // while verifying: return nothing (or return a loader component)
    return null;
  }

  if (!authorized) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}