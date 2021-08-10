import { AnnotationType, ContentResourceType, ProjectType } from "./const";

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

export type TaskAnnotationsDataVO = {
    data: TaskAnnotationVO[];
    createdAt: string;
    updatedAt: string;
};

export type TaskAnnotationVO = {
    id: string;
    annotationClassId: string;
    contentRootId: string;
    type: AnnotationType;
    title: string;
    value: string;
    color: string;
    attributes: {
        code: string;
    }
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

export type ContentRootVO = {
    id: string;
    frames: string[];
};

export type ContentFrameVO = {
    frameNo: string;
    resources: { [key: string]: ContentResourceVO };
};

export type ContentResourceVO = {
    id: string;
    type: ContentResourceType;
    resource: any;
};

export type ValidResultRoot = {
    [key: string]: ValidResult;
}

export type ValidResult = {
    key: string;
    errorMessage: string;
    items?: ValidResult[];
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