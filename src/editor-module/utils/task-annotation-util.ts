import { v4 as uuid } from 'uuid';
import {
  AnnotationClassVO,
  TaskAnnotationOriginVO,
  TaskAnnotationVO,
  ThreePoints,
  ThreePointsMeta,
} from '../types/vo';

const STORE_KEY = [
  'id',
  'annotationClassId',
  'points',
  'createdAt',
  'updatedAt',
];

export const TaskAnnotationUtil = {
  create: (
    annotationClass: AnnotationClassVO,
    frameNo: string,
    frames: string[],
    initPoints: ThreePoints,
    autogenerated?: boolean
  ): TaskAnnotationVO => {
    const now = new Date();
    const { id, type, title, value, color } = annotationClass;

    const points: { [frameNo: string]: ThreePoints } = {};
    const pointsMeta: { [frameNo: string]: ThreePointsMeta } = {};

    if (autogenerated) {
      const currentFrame = parseInt(frameNo);
      const autogeneratedFrame = frames.filter(
        (frame) => parseInt(frame) > currentFrame
      );
      autogeneratedFrame.forEach((frame) => {
        points[frame] = initPoints;
        pointsMeta[frame] = { autogenerated: true };
      });
    }

    points[frameNo] = initPoints;
    pointsMeta[frameNo] = { autogenerated: false };
    return {
      id: uuid().toString(),
      annotationClassId: id,
      type,
      title,
      value,
      color,
      points,
      pointsMeta,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },
  formSaveJson: (vo: TaskAnnotationVO): TaskAnnotationOriginVO => {
    const source = vo as any;
    return STORE_KEY.reduce<any>((r, key) => {
      r[key] = source[key];
      return r;
    }, {});
  },
  merge: (
    voList: TaskAnnotationOriginVO[],
    classVoList: AnnotationClassVO[]
  ): TaskAnnotationVO[] => {
    const classVoObj = classVoList.reduce<{ [key: string]: AnnotationClassVO }>(
      (r, c) => {
        r[c.id] = c;
        return r;
      },
      {}
    );
    return voList.map((vo) => {
      const { type, title, value, color, defaultSize } =
        classVoObj[vo.annotationClassId];
      return { ...vo, type, title, value, color } as TaskAnnotationVO;
    });
  },
  copyFramePoints: (
    voList: TaskAnnotationVO[],
    frameNo: { source: string; dist: string },
    targetId?: string
  ): TaskAnnotationVO[] => {
    const now = new Date();
    return voList.map((vo) => {
      if (targetId && targetId !== vo.id) {
        return vo;
      }
      if (vo.points[frameNo.source] && !vo.points[frameNo.dist]) {
        vo.points[frameNo.dist] = vo.points[frameNo.source];
        vo.updatedAt = now.toISOString();
      }
      return vo;
    });
  },
  findNearestFramePoints: (vo: TaskAnnotationVO, frameNo: string): {prev:string, next:string} => {
    return Object.keys(vo.points)
      .sort()
      .reduce<{ prev: string; next: string }>(
        (r, f) => {
          if (f < r.prev) {
            r.prev = f;
          }
          if (f > r.next) {
            r.next = f;
          }
          return r;
        },
        { prev: frameNo, next: frameNo }
      );
  },
  formatFrameNo: (frameNo: number): string => ('0000' + frameNo).slice(-4),
};
