import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Trading from './pages/Trading';
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
          <Route path="trading" element={<Trading />} />
          <Route path="agents" element={<Agents />} />
          <Route path="news" element={<News />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
