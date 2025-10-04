import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import './App.css';
import Floor from './components/Floor';
import Car from './components/Car';
import Obstacles, { type ObstacleData } from './components/Obstacle';
import TestCarModel from './components/TestCarModel';

function App() {
  const [carPosition, setCarPosition] = useState(new THREE.Vector3());

  const obstacles: ObstacleData[] = [
    { position: [10, 1, 10], size: [2, 2, 2], stoppable: true },
    { position: [-5, 1.5, 15], size: [1, 3, 1], stoppable: true },
    { position: [0, 1, 20], size: [3, 2, 1], stoppable: true },
    { position: [15, 1, -10], size: [2, 2, 2], stoppable: false },
  ];

  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 8, -12], fov: 70 }}
        shadows
        gl={{ antialias: true }}
        scene={{ background: new THREE.Color(0x001030), fog: new THREE.Fog(0x001030, 30, 100) }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={3} castShadow />
          <pointLight position={[0, 5, 0]} intensity={4} />
          <spotLight position={[0, 8, 0]} angle={0.6} penumbra={0.5} intensity={1.5} castShadow />
          <directionalLight position={[-8, 6, 0]} intensity={2} />
          <pointLight position={[10, 3, 5]} intensity={3} />
          {/* Scene axis helper */}
          <axesHelper args={[10]} />
          <Floor carPosition={carPosition} />
          {/* <Obstacles obstacles={obstacles} />
          <Car setCarPosition={setCarPosition} obstacles={obstacles} /> */}
          <TestCarModel />
        </Suspense>
      </Canvas>
      
      <div id="info">
        <strong>Controls:</strong><br />
        W/↑ - Forward<br />
        S/↓ - Backward<br />
        A/← - Steer Left (wheels turn left)<br />
        D/→ - Steer Right (wheels turn right)<br />
        <br />
        <strong>Movement:</strong><br />
        Car moves forward in the direction it's facing<br />
        Steering affects front wheels rotation<br />
        <br />
        <strong>Car Info:</strong><br />
        <span id="car-size">Loading car dimensions...</span>
      </div>
    </div>
  );
}

export default App;