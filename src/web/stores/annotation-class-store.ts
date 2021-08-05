import { useState } from "react";
import { createContainer } from "unstated-next";
import { AnnotationClassVO } from "../types/vo";

const useAnnotationClass = () => {
    const [annotationClassVOs, setAnnotationClassVOs] = useState<{ [key: string]: AnnotationClassVO }>({});
    const fetch = (projectId: string) => {

    };
    const save = (vo: AnnotationClassVO) => {

    };
    return {
        annotationClassVOs,
        fetch,
        save
    };
}

export default createContainer(useAnnotationClass);