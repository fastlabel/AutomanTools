import { v4 as uuid } from 'uuid';
import { AnnotationType } from '../types/const';
import { AnnotationClassVO } from '../types/vo';

export const AnnotationClassUtil = {
  create: (): AnnotationClassVO => {
    const now = new Date();
    return {
      id: uuid().toString(),
      type: AnnotationType.cuboid,
      title: '',
      value: '',
      color: '#' + Math.random().toString(16).substr(-6),
      defaultSize: { x: 1, y: 1, z: 1 },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },
};
