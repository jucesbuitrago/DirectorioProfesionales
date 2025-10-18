import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { isAuthenticated } from './api';

function MyChat() {
  const { control } = useChatKit({
    // Fija UI en español
    locale: 'es',
    // Autenticación con tu backend
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8765';
        const res = await fetch(`${backendUrl}/api/chatkit/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow_id: import.meta.env.VITE_WORKFLOW_ID, // wf_...
            user_id: 'user_' + Date.now(),
          }),
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    // Opcional: logs para ver qué pasa
    onError: ({ error }) => console.error('[ChatKit error]', error),
    onLog: ({ name, data }) => console.debug('[chatkit]', name, data),
  });

  return (
    <div style={{ padding: 16 }}>
      {/* ⚠️ Dale tamaño explícito si no usas Tailwind */}
      <ChatKit control={control} style={{ height: 600, width: 420, border: '1px solid #ddd' }} />
    </div>
  );
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Registro</Link>
        <Link to="/chat">Chat</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <MyChat />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
