import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import modelPath from '../assets/model.glb';

function Model(props) {
  const ref = useRef();
  const gltf = useGLTF(modelPath);

  useFrame((state) => {
    if (!ref.current) return;

    // Base auto-rotation around Y
    const time = state.clock.getElapsedTime();
    const baseY = time * 0.25; // adjust base speed here

    // Interactive only on Y axis: pointer.x modifies Y rotation (clamped)
    const { x } = state.pointer;
    const interactiveY = Math.max(-0.9, Math.min(0.9, x * 0.9));

    ref.current.rotation.y = baseY + interactiveY;
    // ensure X/Z remain static
    ref.current.rotation.x = 0;
    ref.current.rotation.z = 0;
  });

  return <primitive ref={ref} object={gltf.scene} scale={props.scale ?? 0.3} position={props.position ?? [0, -1, 0]} />;
}

useGLTF.preload(modelPath);

export default function ThreeScene() {
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={1.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1.5} />
      <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="#ee6611" wireframe /></mesh>}>
        <Model />
      </Suspense>
      <OrbitControls enableZoom={true} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}
