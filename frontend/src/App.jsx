import { ChatKit, useChatKit } from '@openai/chatkit-react';
import './App.css';

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

function App() {
  return (
    <div>
      <MyChat />
    </div>
  );
}

export default App;
