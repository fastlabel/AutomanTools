import ToolBar from '@fl-three-editor/components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '@fl-three-editor/components/tool-bar-button';
import TaskStore from '@fl-three-editor/stores/task-store';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LabelToolBar: React.FC = () => {
  const [t] = useTranslation();
  const { endLabelView } = TaskStore.useContainer();

  return (
    <ToolBar>
      <ToolBarBoxButtonThemeProvider>
        <ToolBarButton
          toolTip={t('labelToolBar-label__return')}
          icon={<ArrowBackIcon />}
          onClick={() => {
            endLabelView();
          }}
        />
      </ToolBarBoxButtonThemeProvider>
    </ToolBar>
  );
};
export default LabelToolBar;
