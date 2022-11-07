import { TaskAnnotationVO, ThreePoints } from '@fl-three-editor/types/vo';
import {
  Group,
  Vector3,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  BufferGeometry,
  BufferAttribute,
  LineSegments,
  LineBasicMaterial,
} from 'three';

export const buildFlCubeObject3d = (
  taskAnnotationVo: TaskAnnotationVO,
  frameNo: string
): Group | undefined => {
  const points = taskAnnotationVo.points[frameNo];
  if (!points) {
    return undefined;
  }
  const id = taskAnnotationVo.id;
  const [px, py, pz, ax, ay, az, sx, sy, sz] = points;
  const color = taskAnnotationVo.color;

  // dAssistance
  const [width, height, depth] = [0.5, 0.1, 0.1];
  const dAssistancePosition = new Vector3((1 / 4) * 3, 0, 0);

  const material = new MeshBasicMaterial({ color });

  const root = new Group();
  root.name = id;
  root.userData = { type: 'cube' };
  root.rotation.set(ax, ay, az);
  root.position.set(px, py, pz);

  const scaleNode = new Group();
  scaleNode.scale.set(sx, sy, sz);
  root.add(scaleNode);

  const meshCubeDirection = new Mesh();
  meshCubeDirection.position.copy(dAssistancePosition);
  meshCubeDirection.userData = { type: 'cube-direction' };
  meshCubeDirection.geometry = new BoxGeometry(width, height, depth);
  meshCubeDirection.material = material;
  scaleNode.add(meshCubeDirection);

  const meshCubeBox = new Mesh();
  meshCubeBox.userData = { type: 'cube-box' };
  meshCubeBox.geometry = new BoxGeometry(1, 1, 1);
  meshCubeBox.material = new MeshBasicMaterial({
    color,
    opacity: 0.5,
    transparent: true,
  });
  scaleNode.add(meshCubeBox);

  const indices = new Uint16Array([
    0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
  ]);
  const positions = new Float32Array(8 * 3);
  positions.set([
    0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
  ]);
  const geometry = new BufferGeometry();
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const lineSegments = new LineSegments(
    geometry,
    new LineBasicMaterial({ color: color })
  );
  scaleNode.add(lineSegments);

  return root;
};

export const extractFlCubeObject3d = (
  flCube: Group | Object3D
): ThreePoints => {
  if (flCube.children[0] === undefined) {
    console.error(flCube);
    return [
      flCube.position.x,
      flCube.position.y,
      flCube.position.z,
      flCube.rotation.x,
      flCube.rotation.y,
      flCube.rotation.z,
      1,
      1,
      1,
    ];
  }
  return [
    flCube.position.x,
    flCube.position.y,
    flCube.position.z,
    flCube.rotation.x,
    flCube.rotation.y,
    flCube.rotation.z,
    flCube.children[0].scale.x,
    flCube.children[0].scale.y,
    flCube.children[0].scale.z,
  ];
};

export const updateFlCubeObject3d = (
  flCube: Group | Object3D,
  points: ThreePoints
): void => {
  if (flCube.children[0] === undefined) {
    console.error(flCube);
  }
  const [px, py, pz, ax, ay, az, sx, sy, sz] = points;
  flCube.position.setX(px);
  flCube.position.setY(py);
  flCube.position.setZ(pz);
  flCube.rotation.set(ax, ay, az);
  flCube.children[0].scale.setX(sx);
  flCube.children[0].scale.setY(sy);
  flCube.children[0].scale.setZ(sz);
};
