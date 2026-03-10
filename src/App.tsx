import { useEffect, useState } from 'react';
import { useFacebookSDK, FacebookAuthResponse } from './hooks/useFacebookSDK';
import './App.css';

function App() {
  const { isLoaded, isInitialized, getLoginStatus, login } = useFacebookSDK();
  const [authStatus, setAuthStatus] = useState<FacebookAuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('🚀 App iniciado');
    addLog(`📋 App ID configurado: ${import.meta.env.VITE_FACEBOOK_APP_ID || 'NÃO DEFINIDO'}`);
    addLog(`📋 API Version: ${import.meta.env.VITE_FACEBOOK_API_VERSION || 'NÃO DEFINIDO'}`);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      addLog('✅ SDK do Facebook carregado no DOM');
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isInitialized) {
      addLog('✅ SDK do Facebook inicializado com sucesso');
      checkLoginStatus();
    }
  }, [isInitialized]);

  const checkLoginStatus = async () => {
    addLog('🔍 Verificando status de login...');
    const response = await getLoginStatus();
    setAuthStatus(response);
    addLog(`📊 Status retornado: ${response.status}`);
    if (response.authResponse) {
      addLog(`👤 User ID: ${response.authResponse.userID}`);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    addLog('🔐 Iniciando processo de login...');
    const response = await login();
    setAuthStatus(response);
    addLog(`📊 Resultado do login: ${response.status}`);
    if (response.authResponse) {
      addLog(`🎉 Login bem-sucedido! User ID: ${response.authResponse.userID}`);
    } else {
      addLog('❌ Login cancelado ou falhou');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🔗 Facebook Handshake</h1>
      
      <div className="status-card">
        <h2>📡 Status do SDK</h2>
        <p>
          <span className={`status-dot ${isLoaded ? 'active' : ''}`}></span>
          SDK Carregado: {isLoaded ? '✅ Sim' : '⏳ Carregando...'}
        </p>
        <p>
          <span className={`status-dot ${isInitialized ? 'active' : ''}`}></span>
          SDK Inicializado: {isInitialized ? '✅ Sim' : '⏳ Aguardando...'}
        </p>
      </div>

      <div className="log-card">
        <h2>📜 Log de Eventos</h2>
        <div className="log-container">
          {logs.length === 0 ? (
            <p className="log-empty">Nenhum evento ainda...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))
          )}
        </div>
      </div>

      {isInitialized && (
        <div className="status-card">
          <h2>Status da Autenticação</h2>
          {authStatus ? (
            <>
              <p>
                <strong>Status:</strong> {authStatus.status}
              </p>
              {authStatus.authResponse && (
                <>
                  <p>
                    <strong>User ID:</strong> {authStatus.authResponse.userID}
                  </p>
                  <p>
                    <strong>Access Token:</strong>{' '}
                    <code>{authStatus.authResponse.accessToken}</code>
                  </p>
                </>
              )}
            </>
          ) : (
            <p>Verificando status...</p>
          )}

          {authStatus?.status !== 'connected' && (
            <button onClick={handleLogin} disabled={loading} className="login-button">
              {loading ? 'Conectando...' : 'Conectar com Facebook'}
            </button>
          )}
        </div>
      )}

      <div className="info-card">
        <h3>📝 Configuração</h3>
        <p>
          Configure suas variáveis de ambiente no arquivo <code>.env</code>:
        </p>
        <pre>
{`VITE_FACEBOOK_APP_ID=seu-app-id
VITE_FACEBOOK_API_VERSION=v18.0`}
        </pre>
      </div>
    </div>
  );
}

export default App;
