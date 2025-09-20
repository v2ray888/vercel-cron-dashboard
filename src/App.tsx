import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskForm from './components/TaskForm';
import BatchTasks from './pages/BatchTasks';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto py-8">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tasks/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
              <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
              <Route path="/batch-tasks" element={<ProtectedRoute><BatchTasks /></ProtectedRoute>} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;