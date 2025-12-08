import { useState } from 'react';
import { useBrainstormStore } from '../store/brainstormStore';
import './AgentPanel.css';

export function AgentPanel() {
  const { agentMessages } = useBrainstormStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`agent-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="agent-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="agent-header-content">
          <span className="agent-icon">🤖</span>
          <span className="agent-title">AIファシリテーター</span>
          {agentMessages.length > 0 && (
            <span className="message-badge">{agentMessages.length}</span>
          )}
        </div>
        <span className="toggle-icon">{isExpanded ? '▼' : '▲'}</span>
      </div>

      {isExpanded && (
        <div className="agent-panel-content">
          {agentMessages.length === 0 ? (
            <div className="agent-empty">
              <p>AIからのメッセージはまだありません</p>
              <p className="agent-hint">
                アイディアを追加するか、「AI提案」ボタンを押してください
              </p>
            </div>
          ) : (
            <div className="agent-messages">
              {agentMessages.map((message) => (
                <div key={message.id} className={`agent-message agent-message-${message.type}`}>
                  <div className="message-header">
                    <span className="message-type">
                      {message.type === 'question' && '❓ 質問'}
                      {message.type === 'suggestion' && '💡 提案'}
                      {message.type === 'feedback' && '👍 フィードバック'}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
