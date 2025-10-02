import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import CarModel from './CarModel';
import Lights from './Lights';

interface CarProps {
  setCarPosition: (pos: THREE.Vector3) => void;
}

const Car = ({ setCarPosition }: CarProps) => {
  const carRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Object3D>(null); // Ref for rear left wheel
  const rearRightWheelRef = useRef<THREE.Object3D>(null); // Ref for rear right wheel
  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [steerAngle, setSteerAngle] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  const physics = {
    acceleration: 0.008,
    maxSpeed: 0.25,
    friction: 0.96,
    maxSteerAngle: 0.6,
    steerSpeed: 0.08,
    wheelBase: 2
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

    // Update wheel rotation
    const wheels = carRef.current.children.filter(child => child.userData.isWheel);
    wheels.forEach(wheel => {
      if (wheel instanceof THREE.Mesh) {
        wheel.rotation.y = steerAngle;
      }
    });

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
      if (Math.abs(steerAngle) > 0.01) {
        const turningRadius = physics.wheelBase / Math.tan(Math.abs(steerAngle));
        const angularVelocity = currentSpeed / turningRadius;
        carRef.current.rotation.y += Math.sign(steerAngle) * angularVelocity;
      }
      carRef.current.position.x += Math.sin(carRef.current.rotation.y) * currentSpeed;
      carRef.current.position.z += Math.cos(carRef.current.rotation.y) * currentSpeed;
    }

    // Update car position for floor
    setCarPosition(carRef.current.position.clone());


    // Camera follows car
    camera.position.x = carRef.current.position.x;
    camera.position.z = carRef.current.position.z + 10;
    camera.lookAt(carRef.current.position);
  });

  return (
    <group ref={carRef}>
      <CarModel rearLeftWheelRef={rearLeftWheelRef} rearRightWheelRef={rearRightWheelRef} />
      <Lights />
    </group>
  );
};

export default Car;