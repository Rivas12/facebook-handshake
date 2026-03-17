import { useEffect, useRef, useState } from 'react';
import './App.css';

type ProcessStatus = 'idle' | 'received_code' | 'sending' | 'success' | 'error';

const statusLabel: Record<ProcessStatus, string> = {
  idle: 'Aguardando código do Facebook',
  received_code: 'Código recebido',
  sending: 'Enviando para API...',
  success: 'Enviado com sucesso',
  error: 'Erro no envio',
};

const statusMessages: Record<ProcessStatus, string> = {
  idle: '',
  received_code: 'Código recebido.',
  sending: 'Enviando para API...',
  success: 'Código enviado com sucesso.',
  error: 'Erro ao enviar para API.',
};

function App() {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [events, setEvents] = useState<string[]>([]);
  
  const isMountedRef = useRef(true);
  const processedRef = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const backendUrl = import.meta.env.VITE_FACEBOOK_CODE_POST_URL;

  const addEvent = (content: string) => {
    if (!isMountedRef.current) return;
    
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [...prev, `[${timestamp}] ${content}`]);
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    addEvent('Aplicação iniciada.');

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorDescription = params.get('error_description');

    if (!code && !errorDescription) {
      return;
    }

    window.history.replaceState({}, document.title, window.location.pathname);

    if (errorDescription) {
      if (isMountedRef.current) {
        setStatus('error');
        addEvent('Facebook retornou erro.');
      }
      return;
    }

    if (!code) {
      if (isMountedRef.current) {
        setStatus('error');
        addEvent('Retorno sem código.');
      }
      return;
    }

    const processKey = code;
    if (processedRef.current.has(processKey)) {
      if (isMountedRef.current) {
        setStatus('success');
        addEvent('Duplicata ignorada.');
      }
      return;
    }

    processedRef.current.add(processKey);
    
    if (isMountedRef.current) {
      setStatus('received_code');
      addEvent('Código obtido do Facebook.');
    }

    if (!backendUrl) {
      if (isMountedRef.current) {
        setStatus('error');
        addEvent('VITE_FACEBOOK_CODE_POST_URL não definido.');
      }
      return;
    }

    const sendCodeToApi = async () => {
      abortControllerRef.current = new AbortController();

      try {
        if (isMountedRef.current) {
          setStatus('sending');
          addEvent('Enviando para API.');
        }

        const allParams: Record<string, string> = {};
        params.forEach((value, key) => {
          allParams[key] = value;
        });

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (state) {
          headers['Authorization'] = `Bearer ${state}`;
        }

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(allParams),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (isMountedRef.current) {
          setStatus('success');
          addEvent('API confirmou recebimento.');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        
        if (isMountedRef.current) {
          setStatus('error');
          addEvent('Falha no envio.');
        }
      }
    };

    void sendCodeToApi();
  }, [backendUrl]);

  const message = statusMessages[status];

  return (
    <main className="container">
      <section className="panel">
        <p className="eyebrow">Facebook Handshake</p>
        <h1>Conectando...</h1>

        <div className={`status-badge ${status}`}>{statusLabel[status]}</div>

        {message && <p className="message">{message}</p>}

        <div className="timeline">
          <h2>O que aconteceu</h2>
          {events.length === 0 ? (
            <p className="empty">Aguardando resposta do Facebook...</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="event">
                {event}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
