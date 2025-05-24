
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsCheckinDashboard from './components/SportsCheckinDashboard';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SportsCheckinDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
