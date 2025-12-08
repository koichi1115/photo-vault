import { useBrainstormStore } from '../store/brainstormStore';
import './Toolbar.css';

interface ToolbarProps {
  sessionId: string;
  onCreateGroup: () => void;
}

export function Toolbar({ sessionId, onCreateGroup }: ToolbarProps) {
  const { session, disconnect, requestFacilitation } = useBrainstormStore();

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    alert('セッションIDをコピーしました!');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h2 className="toolbar-title">🌌 Mindscape 3D</h2>
        <div className="session-info">
          <span className="session-id" onClick={handleCopySessionId} title="クリックしてコピー">
            📋 {sessionId.substring(0, 12)}...
          </span>
          <span className="user-count">
            👥 {session?.users.length || 0}人参加中
          </span>
        </div>
      </div>

      <div className="toolbar-right">
        <button onClick={onCreateGroup} className="toolbar-btn">
          ➕ グループ作成
        </button>
        <button onClick={requestFacilitation} className="toolbar-btn toolbar-btn-primary">
          🤖 AI提案
        </button>
        <button onClick={disconnect} className="toolbar-btn toolbar-btn-danger">
          退出
        </button>
      </div>
    </div>
  );
}
