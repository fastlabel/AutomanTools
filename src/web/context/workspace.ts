import { useState } from "react";
import { createContainer } from "unstated-next";

const useWorkspace = () => {
    const [workspaceFolder, setWorkspaceFolder] = useState<string>('');

    return {
        workspaceFolder, setWorkspaceFolder
    };
}

export default createContainer(useWorkspace);