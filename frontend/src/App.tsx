import { useState, useEffect } from 'react';
import { JoinScreen } from './components/JoinScreen';
import { BrainstormCanvas } from './components/BrainstormCanvas';
import { PhotoVault } from './components/PhotoVault';
import { useBrainstormStore } from './store/brainstormStore';
import './App.css';

type Tab = 'brainstorm' | 'photos';

function App() {
  const { isConnected, sessionId, currentUser } = useBrainstormStore();
  const [showJoin, setShowJoin] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('brainstorm');

  useEffect(() => {
    if (isConnected && sessionId) {
      setShowJoin(false);
    }
  }, [isConnected, sessionId]);

  const renderContent = () => {
    if (showJoin) {
      return <JoinScreen />;
    }

    return (
      <div>
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '10px 20px',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('brainstorm')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'brainstorm' ? '#007bff' : '#fff',
              color: activeTab === 'brainstorm' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'brainstorm' ? 'bold' : 'normal'
            }}
          >
            🧠 Mindscape 3D
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'photos' ? '#007bff' : '#fff',
              color: activeTab === 'photos' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'photos' ? 'bold' : 'normal'
            }}
          >
            📦 Photo Vault
          </button>
        </div>
        {activeTab === 'brainstorm' ? (
          <BrainstormCanvas />
        ) : (
          <PhotoVault userId={currentUser?.id || 'demo-user'} />
        )}
      </div>
    );
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;
