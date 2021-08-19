import { v4 as uuid } from "uuid";
import { AnnotationClassVO, TaskAnnotationVO } from "../types/vo";


export const TaskAnnotationUtil = {
    create: (annotationClass: AnnotationClassVO, frameNo: string): TaskAnnotationVO => {
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
                code: ''
            },
            points: {
                [frameNo]: [0, 0, 0, x, y, z, 0, 0, 0]
            },
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        }
    }
};