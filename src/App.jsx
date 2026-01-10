import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import GovDashboard from './pages/GovDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/gov-dashboard" element={<GovDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;