import { AnnotationType, ContentResourceType, ProjectType } from "./const";


export type ProjectVO = {
    id: string;
    type: ProjectType;
    createdAt: string;
    updatedAt: string;
};

export type TaskVO = {
    id: string;
    name: string;
    status: string;
    content: ContentRootVO;
    annotations: TaskAnnotationVO[];
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