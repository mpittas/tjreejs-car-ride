import * as THREE from 'three';

interface ObstacleData {
  position: [number, number, number];
  size: [number, number, number];
  stoppable: boolean;
}

interface ObstaclesProps {
  obstacles: ObstacleData[];
}

const Obstacles = ({ obstacles }: ObstaclesProps) => {
  return (
    <>
      {obstacles.map((obstacle, index) => (
        <mesh
          key={index}
          position={obstacle.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={obstacle.size} />
          <meshLambertMaterial color={obstacle.stoppable ? 0xff0000 : 0x00ff00} />
        </mesh>
      ))}
    </>
  );
};

export default Obstacles;
export type { ObstacleData };