import { AnnotationType, ProjectType } from './const';

export type ThreeSize = {
  x: number;
  y: number;
  z: number;
};

export type ProjectVO = {
  id: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
};

export type ProjectAnnotationClassVO = {
  projectId: string;
  annotationClasses: AnnotationClassVO[];
  createdAt: string;
  updatedAt: string;
};

export type TaskVO = {
  // [ref] scope=task
  id: string;
  frames: string[];
  pcdTopicId: string;
  imageTopics: TaskImageTopicVO[];
  createdAt: string;
  updatedAt: string;
};

export type TaskImageTopicVO = {
  topicId: string;
  extension: string;
  calibration?: boolean;
};

export type TaskAnnotationVOPoints = [
  px: number,
  py: number,
  pz: number,
  ax: number,
  ay: number,
  az: number,
  sx: number,
  sy: number,
  sz: number
];

export type TaskAnnotationOriginVO = {
  id: string;
  annotationClassId: string;
  points: { [frameNo: string]: TaskAnnotationVOPoints };
  createdAt: string;
  updatedAt: string;
};

export type TaskAnnotationVO = {
  type: AnnotationType;
  title: string;
  value: string;
  color: string;
} & TaskAnnotationOriginVO;

export type AnnotationClassVO = {
  id: string;
  type: AnnotationType;
  title: string;
  value: string;
  color: string;
  defaultSize: ThreeSize;
  createdAt: string;
  updatedAt: string;
};

// ---- task store VO
export type TaskROMVO = {
  // [ref] ProjectAnnotationClassVO
  projectId: string;
  annotationClasses: AnnotationClassVO[];

  // [ref] TaskVO
  taskId: string;
  frames: string[];
  pcdTopicId: string;
  imageTopics: TaskImageTopicVO[];
  calibrations: { [topicID: string]: TaskCalibrationVO };
};

export type TaskFrameVO = {
  currentFrame: string;
  pcdResource: any;
  imageResources: { [key: string]: any };
};

export type TaskCalibrationVO = {
  cameraExtrinsicMat: [x: number, y: number, z: number, w: number][];
  cameraMat: [x: number, y: number, z: number][];
  distCoeff: number[][];
  imageSize: [width: number, height: number];
};

export type CameraVo = {
  internal: CameraInternal;
};

export type CameraInternal = {
  width: number;
  height: number;
  fy: number;
  fov?: number;
  distance: number;
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
};
