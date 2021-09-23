import { v4 as uuid } from 'uuid';
import {
  AnnotationClassVO,
  TaskAnnotationOriginVO,
  TaskAnnotationVO,
} from '../types/vo';

const STORE_KEY = [
  'id',
  'annotationClassId',
  'attributes',
  'points',
  'createdAt',
  'updatedAt',
];

export const TaskAnnotationUtil = {
  create: (
    annotationClass: AnnotationClassVO,
    frameNo: string
  ): TaskAnnotationVO => {
    const now = new Date();
    const { id, type, title, value, color, defaultSize } = annotationClass;
    const { x, y, z } = defaultSize;
    return {
      id: uuid().toString(),
      annotationClassId: id,
      type,
      title,
      value,
      color,
      attributes: {
        code: '',
      },
      points: {
        // prevent NaN with decimal value
        [frameNo]: [0, 0, 0, Number(x), Number(y), Number(z), 0, 0, 0],
      },
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
  findNearestFramePoints: (vo: TaskAnnotationVO, frameNo: string) => {
    const res = Object.keys(vo.points)
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
    if (res.prev !== frameNo) {
      return res.prev;
    }
    if (res.next !== frameNo) {
      return res.next;
    }
    throw new Error(`find id:${vo.id} frameNo:${frameNo}`);
  },
};
