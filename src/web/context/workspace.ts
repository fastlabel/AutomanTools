import { useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';

const useWorkspace = () => {
  const [workspaceFolder, setWorkspaceFolder] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  const folderName = useMemo(() => {
    if (workspaceFolder) {
      let paths = workspaceFolder.split('\\');
      if (paths.length > 1) {
        paths = workspaceFolder.split('/');
      }
      return paths[paths.length - 1];
    }
    return '';
  }, [workspaceFolder]);

  return {
    workspaceFolder,
    setWorkspaceFolder,
    forceUpdate,
    setForceUpdate,
    folderName,
  };
};

export default createContainer(useWorkspace);
