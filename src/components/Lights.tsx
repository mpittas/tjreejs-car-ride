import { useMemo } from 'react';
import * as THREE from 'three';

const Lights = () => {
  // Headlight beam shader
  const beamMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          float distFromCenter = length(vUv - vec2(0.5)) * 2.0;
          float normalizedPos = (vPosition.y + 2.0) / 4.0;
          float lengthFade = pow(1.0 - normalizedPos, 0.7);
          float alpha = smoothstep(0.0, 1.0, (1.0 - distFromCenter) * lengthFade);
          gl_FragColor = vec4(vec3(0.7, 0.7, 0.45), pow(alpha, 2.0) * 0.25);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const lightConfig: { x: number; beamPos: [number, number]; targetZ: number }[] = [
    { x: -0.7, beamPos: [0.6, 3.5], targetZ: 6 },
    { x: 0.7, beamPos: [0.6, 3.5], targetZ: 6 }
  ];

  return (
    <group>
      {lightConfig.map(({ x, beamPos, targetZ }, index) => (
        <group key={index}>
          {/* Beam */}
          <mesh position={[x, beamPos[0], beamPos[1]]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[2.8, 0.05, 4, 32, 1, true]} />
            <primitive object={beamMaterial} attach="material" />
          </mesh>

          {/* Bulb */}
          <mesh position={[x, 0.6, 1.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={0xaaaa44} />
          </mesh>

          {/* Point light */}
          <pointLight position={[x, 0.6, 1.5]} color={0xaaaa88} intensity={1} distance={4} />

          {/* Spotlight */}
          <spotLight
            position={[x, 0.6, 1.5]}
            color={0xaaaa88}
            intensity={2}
            angle={Math.PI / 6}
            penumbra={0.3}
            decay={1.5}
            distance={8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          >
            <object3D position={[x, 0, targetZ]} />
          </spotLight>
        </group>
      ))}
    </group>
  );
};

export default Lights;