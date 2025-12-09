import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import { Mesh } from 'three';
import { IdeaGroup } from '@glacier-photo-vault/shared';

interface GroupSphereProps {
  group: IdeaGroup;
  position: [number, number, number];
}

export function GroupSphere({ group, position }: GroupSphereProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Rotate the group sphere slowly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      if (hovered) {
        meshRef.current.scale.setScalar(1.15);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[1.5, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={group.color}
          emissive={group.color}
          emissiveIntensity={hovered ? 0.7 : 0.3}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
          wireframe={false}
        />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial
          color={group.color}
          transparent
          opacity={hovered ? 0.2 : 0.1}
        />
      </Sphere>

      {/* Group name */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.5}
        color={group.color}
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
        fontWeight="bold"
      >
        {group.name}
      </Text>

      {/* Idea count badge */}
      <Text
        position={[0, 0, 1.6]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {group.ideas.length}
      </Text>
    </group>
  );
}
