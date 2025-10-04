import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoxHelper } from 'three';

const TestCarModel = () => {
  const { nodes } = useGLTF('/car2.glb');
  const carRef = useRef<THREE.Group>(null);
  const boundingBoxRef = useRef<BoxHelper | null>(null);
  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [steerAngle, setSteerAngle] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [boundingBoxSize, setBoundingBoxSize] = useState<THREE.Vector3>(new THREE.Vector3());

  const steeringFL = nodes.steeringFL;
  const steeringFR = nodes.steeringFR;
  const wheelFL = nodes.wheelFL;
  const wheelFR = nodes.wheelFR;
  const wheelRL = nodes.wheelRL;
  const wheelRR = nodes.wheelRR;

  const physics = {
    acceleration: 0.008,
    maxSpeed: 0.25,
    friction: 0.96,
    maxSteerAngle: 0.6,
    steerSpeed: 0.08,
    wheelBase: 2,
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

  useEffect(() => {
    if (carRef.current && nodes.Scene) {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(nodes.Scene);
      const size = box.getSize(new THREE.Vector3());
      setBoundingBoxSize(size);
      
      // Create and add bounding box helper
      if (boundingBoxRef.current) {
        carRef.current.remove(boundingBoxRef.current);
      }
      boundingBoxRef.current = new BoxHelper(nodes.Scene, 0xffff00);
      carRef.current.add(boundingBoxRef.current);
      
      // Update UI with car dimensions
      const sizeElement = document.getElementById('car-size');
      if (sizeElement) {
        sizeElement.textContent = `Size: X=${size.x.toFixed(2)}, Y=${size.y.toFixed(2)}, Z=${size.z.toFixed(2)} world units`;
      }
    }
  }, [nodes.Scene]);

  useFrame(() => {
    if (!carRef.current) return;

    // Steering
    let targetSteerAngle = 0;
    if (keys.a || keys.arrowleft) targetSteerAngle = physics.maxSteerAngle;
    else if (keys.d || keys.arrowright) targetSteerAngle = -physics.maxSteerAngle;

    setSteerAngle(prev => prev + (targetSteerAngle - prev) * physics.steerSpeed);

    // Update steering wheels rotation
    if (steeringFL) {
      steeringFL.rotation.y = steerAngle;
    }
    if (steeringFR) {
      steeringFR.rotation.y = steerAngle;
    }
    
    // Also update the actual wheel nodes for visual feedback
    if (wheelFL) {
      wheelFL.rotation.y = steerAngle;
    }
    if (wheelFR) {
      wheelFR.rotation.y = steerAngle;
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
      let newRotationY = carRef.current.rotation.y;
      if (Math.abs(steerAngle) > 0.01) {
        const turningRadius = physics.wheelBase / Math.tan(Math.abs(steerAngle));
        const angularVelocity = currentSpeed / turningRadius;
        newRotationY += Math.sign(steerAngle) * angularVelocity;
      }
      const newX = carRef.current.position.x + Math.sin(newRotationY) * currentSpeed;
      const newZ = carRef.current.position.z + Math.cos(newRotationY) * currentSpeed;

      carRef.current.rotation.y = newRotationY;
      carRef.current.position.x = newX;
      carRef.current.position.z = newZ;
    }

    // Rotate wheels based on speed
    const wheelRotationSpeed = currentSpeed * 2;
    if (wheelFL) wheelFL.rotation.x += wheelRotationSpeed;
    if (wheelFR) wheelFR.rotation.x += wheelRotationSpeed;
    if (wheelRL) wheelRL.rotation.x += wheelRotationSpeed;
    if (wheelRR) wheelRR.rotation.x += wheelRotationSpeed;

    // Camera follows car - closer view
    camera.position.x = carRef.current.position.x + 3;
    camera.position.y = carRef.current.position.y + 2;
    camera.position.z = carRef.current.position.z - 8;
    camera.lookAt(carRef.current.position.clone().add(new THREE.Vector3(0, 0, 3)));
  });

  return (
    <group ref={carRef}>
      <primitive object={nodes.Scene} />
      {/* Debug arrow to show front of car */}
      <arrowHelper
        args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 3, 0xff0000]}
      />
      {/* Debug text to label front */}
      <mesh position={[0, 2, 2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={0x00ff00} />
      </mesh>
      {/* XYZ axis helpers for the car */}
      <axesHelper args={[5]} />
    </group>
  );
};

export default TestCarModel;