import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import { Mesh } from 'three';
import { Idea } from '@glacier-photo-vault/shared';

interface IdeaSphereProps {
  idea: Idea;
  position: [number, number, number];
}

export function IdeaSphere({ idea, position }: IdeaSphereProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Animate sphere with gentle floating motion
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;

      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.8, 32, 32]}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#667eea"
          emissive={hovered ? "#764ba2" : "#000000"}
          emissiveIntensity={hovered ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Glow effect */}
      <Sphere args={[1, 32, 32]}>
        <meshBasicMaterial
          color="#667eea"
          transparent
          opacity={hovered ? 0.3 : 0.1}
        />
      </Sphere>

      {/* Text label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
      >
        {idea.content.length > 30 ? idea.content.substring(0, 30) + '...' : idea.content}
      </Text>

      {/* Detailed text on hover */}
      {hovered && idea.content.length > 30 && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
          textAlign="center"
        >
          {idea.content}
        </Text>
      )}
    </group>
  );
}
