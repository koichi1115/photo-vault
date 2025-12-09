import { Line } from '@react-three/drei';
import { Session, IdeaGroup, Idea } from '@glacier-photo-vault/shared';

interface ConnectionLinesProps {
  session: Session | null;
}

export function ConnectionLines({ session }: ConnectionLinesProps) {
  if (!session) return null;

  const connections: Array<{
    start: [number, number, number];
    end: [number, number, number];
    color: string;
  }> = [];

  // Create connections between ideas and groups
  session.groups.forEach((group: IdeaGroup, groupIndex: number) => {
    const groupPos: [number, number, number] = [
      group.position?.x || groupIndex * 8 - 10,
      group.position?.y || groupIndex * 6 - 8,
      -2
    ];

    group.ideas.forEach((ideaId: string) => {
      const idea = session.ideas.find((i: Idea) => i.id === ideaId);
      if (idea) {
        const ideaIndex = session.ideas.indexOf(idea);
        const ideaPos: [number, number, number] = [
          idea.position?.x || (ideaIndex % 5 - 2) * 5,
          idea.position?.y || Math.floor(ideaIndex / 5) * 5 - 5,
          0
        ];

        connections.push({
          start: ideaPos,
          end: groupPos,
          color: group.color
        });
      }
    });
  });

  return (
    <group>
      {connections.map((conn, index) => (
        <Line
          key={index}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={2}
          transparent
          opacity={0.5}
          dashed={false}
        />
      ))}
    </group>
  );
}
