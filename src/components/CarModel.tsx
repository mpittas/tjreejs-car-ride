import { useRef, type RefObject } from 'react';
import * as THREE from 'three';

interface CarModelProps {
  rearLeftWheelRef: RefObject<THREE.Object3D | null>;
  rearRightWheelRef: RefObject<THREE.Object3D | null>;
  frontLeftWheelRef: RefObject<THREE.Object3D | null>;
  frontRightWheelRef: RefObject<THREE.Object3D | null>;
}

const CarModel = ({ rearLeftWheelRef, rearRightWheelRef, frontLeftWheelRef, frontRightWheelRef }: CarModelProps) => {
  const carRef = useRef<THREE.Group>(null);

  // Helper to create mesh with shadow
  const createMesh = (geometry: THREE.BufferGeometry, color: number, castShadow = true) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
    mesh.castShadow = castShadow;
    return mesh;
  };

  // Body and cabin
  const body = createMesh(new THREE.BoxGeometry(2, 0.8, 3), 0xff4444);
  body.position.y = 0.7;

  const cabin = createMesh(new THREE.BoxGeometry(1.6, 0.8, 1.8), 0x444444);
  cabin.position.set(0, 1.3, -0.2);

  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelPositions: [number, number, number][] = [[-1, 0.4, 1], [1, 0.4, 1], [-1, 0.4, -1], [1, 0.4, -1]];
  const wheels = wheelPositions.map((pos, index) => {
    const wheel = createMesh(wheelGeometry, 0x222222);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    wheel.userData = { isWheel: true };

    // Attach refs to rear wheels
    if (index === 2) { // Assuming index 2 is rear-left
      rearLeftWheelRef.current = wheel;
    } else if (index === 3) { // Assuming index 3 is rear-right
      rearRightWheelRef.current = wheel;
    }

    // Attach refs to front wheels
    if (index === 0) { // front left
      frontLeftWheelRef.current = wheel;
    } else if (index === 1) { // front right
      frontRightWheelRef.current = wheel;
    }
    return wheel;
  });

  return (
    <group ref={carRef}>
      <primitive object={body} />
      <primitive object={cabin} />
      {wheels.map((wheel, index) => (
        <primitive key={index} object={wheel} />
      ))}
    </group>
  );
};

export default CarModel;