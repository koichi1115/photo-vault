import { useState } from 'react';
import { useBrainstormStore } from '../store/brainstormStore';
import './JoinScreen.css';

export function JoinScreen() {
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const connect = useBrainstormStore(state => state.connect);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && sessionId.trim()) {
      connect(sessionId.trim(), userName.trim());
    }
  };

  const handleQuickStart = () => {
    const randomSessionId = `session-${Math.random().toString(36).substring(7)}`;
    if (userName.trim()) {
      connect(randomSessionId, userName.trim());
    }
  };

  return (
    <div className="join-screen">
      <div className="join-container">
        <h1 className="join-title">🌌 Mindscape 3D</h1>
        <p className="join-subtitle">
          3D空間でAIと共創するブレインストーミング
        </p>

        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="userName">あなたの名前</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="例: 山田太郎"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sessionId">セッションID</label>
            <input
              id="sessionId"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="既存のセッションIDを入力"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              セッションに参加
            </button>
            <button
              type="button"
              onClick={handleQuickStart}
              className="btn btn-secondary"
            >
              新規セッションを開始
            </button>
          </div>
        </form>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🌟</span>
            <span>3D空間での可視化</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span>AIファシリテーション</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span>没入型体験</span>
          </div>
        </div>
      </div>
    </div>
  );
}
