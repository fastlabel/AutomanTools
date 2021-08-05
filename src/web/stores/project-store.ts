import { useState } from "react";
import { createContainer } from "unstated-next";
import { ProjectVO } from "../types/vo";

const useProject = () => {
    const [project, setProject] = useState<ProjectVO>();

    const open = (projectId: string) => {
    };
    const save = (vo: ProjectVO) => {
    };

    return {
        project,
        open,
        save,
    };
}

export default createContainer(useProject);