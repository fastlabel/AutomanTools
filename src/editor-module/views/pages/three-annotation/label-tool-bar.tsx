import ToolBar from '@fl-three-editor/components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '@fl-three-editor/components/tool-bar-button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import TaskStore from '@fl-three-editor/stores/task-store';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';

type Props = {
  onEndLabelView: () => void;
};

const LabelToolBar: React.FC<Props> = ({ onEndLabelView }) => {
  const [t] = useTranslation();
  const { taskToolBar, updateTaskToolBar } = TaskStore.useContainer();

  return (
    <ToolBar>
      <ToolBarBoxButtonThemeProvider>
        <ToolBarButton
          toolTip={t('labelToolBar-label__return')}
          icon={<ArrowBackIcon />}
          onClick={() => {
            onEndLabelView();
          }}
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__interpolation')}
          active={taskToolBar.interpolation}
          icon={<DynamicFeedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({
              ...pre,
              interpolation: !pre.interpolation,
            }))
          }
        />
      </ToolBarBoxButtonThemeProvider>
    </ToolBar>
  );
};
export default LabelToolBar;
