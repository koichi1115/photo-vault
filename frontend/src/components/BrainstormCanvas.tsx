import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useBrainstormStore } from '../store/brainstormStore';
import { Idea, IdeaGroup } from '@glacier-photo-vault/shared';
import { IdeaSphere } from './IdeaSphere';
import { GroupSphere } from './GroupSphere';
import { Toolbar } from './Toolbar';
import { AgentPanel } from './AgentPanel';
import { ConnectionLines } from './ConnectionLines';
import './BrainstormCanvas.css';
import { v4 as uuidv4 } from 'uuid';

export function BrainstormCanvas() {
  const { session, addIdea, createGroup } = useBrainstormStore();
  const [newIdeaText, setNewIdeaText] = useState('');

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdeaText.trim()) {
      addIdea(newIdeaText, {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20
      });
      setNewIdeaText('');
    }
  };

  const handleCreateGroup = () => {
    const groupId = uuidv4();
    createGroup({
      id: groupId,
      name: '新しいグループ',
      ideas: [],
      color: getRandomColor(),
      position: {
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 25
      }
    });
  };

  return (
    <div className="brainstorm-canvas">
      <Toolbar
        sessionId={session?.id || ''}
        onCreateGroup={handleCreateGroup}
      />

      <div className="canvas-container-3d">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 30]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={100}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Background stars */}
          <Stars />

          {/* Render ideas as spheres */}
          {session?.ideas.map((idea: Idea, index: number) => (
            <IdeaSphere
              key={idea.id}
              idea={idea}
              position={[
                idea.position?.x || (index % 5 - 2) * 5,
                idea.position?.y || Math.floor(index / 5) * 5 - 5,
                0
              ]}
            />
          ))}

          {/* Render groups as larger spheres */}
          {session?.groups.map((group: IdeaGroup, index: number) => (
            <GroupSphere
              key={group.id}
              group={group}
              position={[
                group.position?.x || index * 8 - 10,
                group.position?.y || index * 6 - 8,
                -2
              ]}
            />
          ))}

          {/* Connection lines between ideas and groups */}
          <ConnectionLines session={session} />
        </Canvas>
      </div>

      <div className="input-panel">
        <form onSubmit={handleAddIdea} className="idea-input-form">
          <input
            type="text"
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            placeholder="アイディアを入力してください..."
            className="idea-input"
          />
          <button type="submit" className="add-idea-btn">
            追加
          </button>
        </form>
      </div>

      <AgentPanel />
    </div>
  );
}

// Stars component for background
function Stars() {
  const starsRef = useRef<any>();
  const starPositions = useRef((() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  })()).current;

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
