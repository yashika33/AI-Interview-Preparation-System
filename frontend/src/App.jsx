import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Report from './pages/Report';
import InterviewHistory from './pages/InterviewHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/:interviewId" element={<Interview />} />
        <Route path="/history" element={<InterviewHistory />} />
        <Route path="/report/:interviewId" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;