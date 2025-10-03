import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import CarModel from './CarModel';
import Lights from './Lights';
import { type ObstacleData } from './Obstacle';

interface CarProps {
  setCarPosition: (pos: THREE.Vector3) => void;
  obstacles: ObstacleData[];
}

const Car = ({ setCarPosition, obstacles }: CarProps) => {
  const carRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Object3D>(null); // Ref for rear left wheel
  const rearRightWheelRef = useRef<THREE.Object3D>(null); // Ref for rear right wheel
  const frontLeftWheelRef = useRef<THREE.Object3D>(null); // Ref for front left wheel
  const frontRightWheelRef = useRef<THREE.Object3D>(null); // Ref for front right wheel
  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [steerAngle, setSteerAngle] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Local bounding box corners (approximate car dimensions)
  const localCorners = [
    new THREE.Vector3(-1.4, 0, -1.4),
    new THREE.Vector3(-1.4, 0, 1.4),
    new THREE.Vector3(-1.4, 2.1, -1.4),
    new THREE.Vector3(-1.4, 2.1, 1.4),
    new THREE.Vector3(1.4, 0, -1.4),
    new THREE.Vector3(1.4, 0, 1.4),
    new THREE.Vector3(1.4, 2.1, -1.4),
    new THREE.Vector3(1.4, 2.1, 1.4),
  ];

  const physics = {
    acceleration: 0.008,
    maxSpeed: 0.25,
    friction: 0.96,
    maxSteerAngle: 0.6,
    steerSpeed: 0.08,
    wheelBase: 2,
    bounceDamping: 0.7
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: true, [e.key]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: false, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!carRef.current) return;

    // Steering
    let targetSteerAngle = 0;
    if (keys.a || keys.arrowleft) targetSteerAngle = physics.maxSteerAngle;
    else if (keys.d || keys.arrowright) targetSteerAngle = -physics.maxSteerAngle;

    setSteerAngle(prev => prev + (targetSteerAngle - prev) * physics.steerSpeed);

    // Update front wheel rotation for steering
    if (frontLeftWheelRef.current) {
      frontLeftWheelRef.current.rotation.y = steerAngle;
    }
    if (frontRightWheelRef.current) {
      frontRightWheelRef.current.rotation.y = steerAngle;
    }

    // Acceleration
    let targetAcceleration = 0;
    if (keys.w || keys.arrowup) targetAcceleration = physics.acceleration;
    else if (keys.s || keys.arrowdown) targetAcceleration = -physics.acceleration;

    setCurrentSpeed(prev => {
      let newSpeed = prev + targetAcceleration;
      newSpeed *= physics.friction;
      newSpeed = Math.max(-physics.maxSpeed, Math.min(physics.maxSpeed, newSpeed));
      if (Math.abs(newSpeed) < 0.001) newSpeed = 0;
      return newSpeed;
    });

    // Movement
    if (Math.abs(currentSpeed) > 0.001) {
      // Calculate potential new position and rotation
      let newRotationY = carRef.current.rotation.y;
      if (Math.abs(steerAngle) > 0.01) {
        const turningRadius = physics.wheelBase / Math.tan(Math.abs(steerAngle));
        const angularVelocity = currentSpeed / turningRadius;
        newRotationY += Math.sign(steerAngle) * angularVelocity;
      }
      const newX = carRef.current.position.x + Math.sin(newRotationY) * currentSpeed;
      const newZ = carRef.current.position.z + Math.cos(newRotationY) * currentSpeed;

      // Compute potential car AABB
      const tempMatrix = new THREE.Matrix4().makeRotationY(newRotationY).setPosition(newX, carRef.current.position.y, newZ);
      const newWorldCorners = localCorners.map(corner => corner.clone().applyMatrix4(tempMatrix));
      const carAABB = new THREE.Box3().setFromPoints(newWorldCorners);

      // Check collision with obstacles
      let collision = false;
      for (const obstacle of obstacles) {
        if (!obstacle.stoppable) continue;
        const halfSize = new THREE.Vector3(...obstacle.size).multiplyScalar(0.5);
        const obstaclePos = new THREE.Vector3(...obstacle.position);
        const obstacleBox = new THREE.Box3(obstaclePos.clone().sub(halfSize), obstaclePos.clone().add(halfSize));
        if (carAABB.intersectsBox(obstacleBox)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        carRef.current.rotation.y = newRotationY;
        carRef.current.position.x = newX;
        carRef.current.position.z = newZ;
      } else {
        // Bounce back smoothly
        setCurrentSpeed(prev => -prev * physics.bounceDamping);
      }
    }

    // Update car position for floor
    setCarPosition(carRef.current.position.clone());


    // Camera follows car from behind
    camera.position.x = carRef.current.position.x;
    camera.position.y = carRef.current.position.y + 8;
    camera.position.z = carRef.current.position.z - 12;
    camera.lookAt(carRef.current.position.clone().add(new THREE.Vector3(0, 0, 5)));
  });

  return (
    <group ref={carRef}>
      <CarModel rearLeftWheelRef={rearLeftWheelRef} rearRightWheelRef={rearRightWheelRef} frontLeftWheelRef={frontLeftWheelRef} frontRightWheelRef={frontRightWheelRef} />
      <Lights />
    </group>
  );
};

export default Car;