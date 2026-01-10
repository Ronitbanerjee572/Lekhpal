import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function Globe() {
  const mesh = useRef();

  useFrame(() => {
    mesh.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={mesh} scale={2.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#44aaee" roughness={0.7} metalness={0.1} />
      {/* Simple Land Markers */}
      <mesh position={[0.8, 0.2, 0.5]} scale={0.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ee6611" />
      </mesh>
      <mesh position={[-0.5, 0.5, 0.8]} scale={0.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ee6611" />
      </mesh>
      <mesh position={[0.2, -0.6, 0.7]} scale={0.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ee6611" />
      </mesh>
    </mesh>
  );
}

export default function GlobeView() {
  return (
    <div className="h-[60vh] w-full bg-black rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white p-2 rounded backdrop-blur-sm">
            <p className="text-sm font-bold">Interactive Land Map</p>
            <p className="text-xs text-gray-300">Drag to rotate • Scroll to zoom</p>
        </div>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Globe />
        <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  );
}
