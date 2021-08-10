import { v4 as uuid } from "uuid";
import { AnnotationType } from "../types/const";
import { AnnotationClassVO } from "../types/vo";


export const AnnotationClassUtil = {
    create: (): AnnotationClassVO => {
        const now = new Date();
        return {
            id: uuid().toString(),
            type: AnnotationType.cuboid,
            title: '',
            value: '',
            color: '#ffffff',
            defaultSize: { x: 0, y: 0, z: 0 },
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        }
    }
};