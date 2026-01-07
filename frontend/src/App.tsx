import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Events from './pages/Events';
import Trading from './pages/Trading';
import AIChat from './pages/AIChat';
import AutonomousTrading from './pages/AutonomousTrading';
import MarketCreation from './pages/MarketCreation';
import Agents from './pages/Agents';
import News from './pages/News';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          <Route path="events" element={<Events />} />
          <Route path="trading" element={<Trading />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="autonomous-trading" element={<AutonomousTrading />} />
          <Route path="market-creation" element={<MarketCreation />} />
          <Route path="agents" element={<Agents />} />
          <Route path="news" element={<News />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
