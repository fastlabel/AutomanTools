import { AnnotationType, ProjectType } from "./const";

export type ThreeSize = {
    x: number;
    y: number;
    z: number;
}

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
    topicId: string,
    extension: string
};

export type TaskAnnotationVO = {
    id: string;
    annotationClassId: string;
    type: AnnotationType;
    title: string;
    value: string;
    color: string;
    attributes: {
        code: string;
    },
    points: { [frameNo: string]: number[] };
    createdAt: string;
    updatedAt: string;
};

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
};

export type TaskFrameVO = {
    currentFrame: string;
    pcdResource: any;
    imageResources: { [key: string]: any };
};