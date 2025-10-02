import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FloorProps {
  carPosition: THREE.Vector3;
}

const Floor = ({ carPosition }: FloorProps) => {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uCameraPos: { value: new THREE.Vector3() },
        uGridSize: { value: 10.0 },
        uGridColor: { value: new THREE.Color(0xaaaaaa) },
        uGroundColor: { value: new THREE.Color(0x1a4d1a) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uCameraPos;
        uniform float uGridSize;
        uniform vec3 uGridColor;
        uniform vec3 uGroundColor;
        varying vec3 vWorldPosition;

        void main() {
          vec2 coord = vWorldPosition.xz;
          vec2 grid = abs(fract(coord / uGridSize - 0.5) - 0.5) / fwidth(coord / uGridSize);
          float line = min(grid.x, grid.y);
          float gridStrength = 1.0 - min(line, 1.0);

          float dist = length(vWorldPosition.xz - uCameraPos.xz);
          float fadeFactor = 1.0 - smoothstep(80.0, 200.0, dist);
          gridStrength *= fadeFactor;

          vec3 color = mix(uGroundColor, uGridColor, gridStrength * 0.7);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      shaderMaterial.uniforms.uCameraPos.value.copy(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} position={[carPosition.x, 0, carPosition.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};

export default Floor;