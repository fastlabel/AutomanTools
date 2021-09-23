import { useState } from 'react';
import { createContainer } from 'unstated-next';

const useWorkspace = () => {
  const [workspaceFolder, setWorkspaceFolder] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  return {
    workspaceFolder,
    setWorkspaceFolder,
    forceUpdate,
    setForceUpdate,
  };
};

export default createContainer(useWorkspace);
