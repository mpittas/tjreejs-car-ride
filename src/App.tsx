import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import Floor from './components/Floor';
import Car from './components/Car';

function App() {
  const [carPosition, setCarPosition] = useState(new THREE.Vector3());

  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 15, 10], fov: 75 }}
        shadows
        gl={{ antialias: true }}
        scene={{ background: new THREE.Color(0x000520), fog: new THREE.Fog(0x000520, 30, 100) }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[10, 20, 10]} intensity={0.25} castShadow />
          <Floor carPosition={carPosition} />
          <Car setCarPosition={setCarPosition} />
        </Suspense>
      </Canvas>
      <div id="info">
        <strong>Controls:</strong><br />
        W/↑ - Forward<br />
        S/↓ - Backward<br />
        A/← - Steer Left<br />
        D/→ - Steer Right
      </div>
    </div>
  );
}

export default App;