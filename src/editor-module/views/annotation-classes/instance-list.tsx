import {
  Collapse,
  createStyles,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FLTextField from '../../components/fields/fl-text-field';
import { FormState } from '../../components/fields/type';
import { UpdateTaskAnnotationCommand } from '../../stores/task-store';
import { AnnotationType } from '../../types/const';
import { TaskAnnotationVO } from '../../types/vo';
import { FormatUtil } from '../../utils/format-util';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flexGrow: {
      flexGrow: 1,
    },
    otherFrameItem: {
      opacity: 0.8,
    },
    markCuboid: {
      marginRight: theme.spacing(1),
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#ffffff',
      boxSizing: 'border-box',
      minWidth: theme.spacing(2),
      minHeight: theme.spacing(2),
    },
  })
);

type Props = {
  frameNo: string;
  instances: TaskAnnotationVO[];
  multiFrame: boolean;
  editingTaskAnnotation?: TaskAnnotationVO;
  invisibleClasses?: Set<string>;
  selectedItems?: Set<string>;
  onClickItem?: (
    item: TaskAnnotationVO,
    mode?: 'add' | 'remove' | 'single' | 'clear'
  ) => void;
  onClickToggleInvisible?: (item: TaskAnnotationVO, visible: boolean) => void;
  onUpdateTaskAnnotation?: (event: UpdateTaskAnnotationCommand) => void;
};

const resolveMode = (selected: boolean, event: any) => {
  if (event.ctrlKey) {
    return selected ? 'remove' : 'add';
  }
  return selected ? 'clear' : 'single';
};

const InstanceList: FC<Props> = ({
  frameNo,
  instances,
  multiFrame,
  editingTaskAnnotation,
  invisibleClasses,
  selectedItems,
  onClickItem = (f) => f,
  onClickToggleInvisible,
  onUpdateTaskAnnotation = (f) => f,
}) => {
  const styles = useStyles();
  const [t] = useTranslation();

  const [anchor, setAnchor] = React.useState<null | {
    element: HTMLElement;
    vo: TaskAnnotationVO;
  }>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, vo: TaskAnnotationVO) => {
      setAnchor({ element: event.currentTarget, vo });
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchor(null);
  }, []);

  const collapseContent = useMemo(
    () => (item: TaskAnnotationVO) => {
      const [
        positionX,
        positionY,
        positionZ,
        rotationX,
        rotationY,
        rotationZ,
        sizeX,
        sizeY,
        sizeZ,
      ] = item.points[frameNo] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const data = {
        positionX,
        positionY,
        positionZ,
        rotationX,
        rotationY,
        rotationZ,
        sizeX,
        sizeY,
        sizeZ,
      };
      const formObj: FormState<any> = { data };
      return (
        <Collapse in={true} timeout={100} unmountOnExit>
          <List disablePadding>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__positionX')}
                form={['positionX', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__positionY')}
                form={['positionY', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__positionZ')}
                form={['positionZ', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__rotationX')}
                form={['rotationX', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__rotationY')}
                form={['rotationY', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__rotationZ')}
                form={['rotationZ', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__sizeX')}
                form={['sizeX', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__sizeY')}
                form={['sizeY', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={t('instanceList-label__sizeZ')}
                form={['sizeZ', formObj]}
              />
            </ListItem>
          </List>
        </Collapse>
      );
    },
    []
  );

  const listItemRenderer = useMemo(
    () =>
      (
        item: TaskAnnotationVO,
        content?: (item: TaskAnnotationVO) => JSX.Element
      ) => {
        const hasFrame = item.points[frameNo];
        const selected = selectedItems?.has(item.id) === true;
        const hidden = invisibleClasses?.has(item.id);

        return (
          <React.Fragment key={item.id}>
            <ListItem
              className={hasFrame ? undefined : styles.otherFrameItem}
              button
              dense
              selected={selected}
              onClick={
                hasFrame
                  ? (event) => onClickItem(item, resolveMode(selected, event))
                  : undefined
              }>
              <span
                style={{ backgroundColor: item.color }}
                className={getClassTagStyle(item.type)}
              />
              <ListItemText
                primary={item.title}
                secondary={`id ${FormatUtil.omitVal(item.id, 3)}`}
                className={styles.flexGrow}
              />
              {hasFrame ? (
                selected ? (
                  <ExpandLess color="action" />
                ) : (
                  <ExpandMore color="action" />
                )
              ) : undefined}
              <ListItemSecondaryAction>
                <IconButton
                  aria-controls="task-annotation-menu"
                  aria-haspopup="true"
                  color="default"
                  size="small"
                  onClick={(event) => handleClick(event, item)}>
                  <MoreVertOutlinedIcon fontSize="small" />
                </IconButton>
                {onClickToggleInvisible ? (
                  <IconButton
                    color="default"
                    size="small"
                    onClick={() => onClickToggleInvisible(item, false)}>
                    {hidden ? (
                      <VisibilityOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                ) : undefined}
              </ListItemSecondaryAction>
            </ListItem>
            {content && content(item)}
          </React.Fragment>
        );
      },
    [invisibleClasses, selectedItems]
  );

  const [disabledAddFrame, disabledRemoveFrame, disabledRemoveAll] =
    useMemo(() => {
      if (anchor) {
        const disabledAddFrame = !!anchor.vo.points[frameNo];
        const disabledRemoveFrame =
          !disabledAddFrame || Object.keys(anchor.vo.points).length === 1;
        return [disabledAddFrame, disabledRemoveFrame, false];
      }
      return [true, true, true];
    }, [anchor]);

  const getClassTagStyle = (type: AnnotationType): any => {
    return styles.markCuboid;
  };

  return (
    <>
      <List component="div" disablePadding>
        {selectedItems?.size === 1 && editingTaskAnnotation
          ? listItemRenderer(editingTaskAnnotation, collapseContent)
          : instances.map((item, index) => listItemRenderer(item))}
      </List>
      <Menu
        id="task-annotation-menu"
        anchorEl={anchor?.element}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleClose}>
        {multiFrame && (
          <MenuItem
            disabled={disabledAddFrame}
            onClick={() => {
              if (anchor) {
                onUpdateTaskAnnotation({
                  type: 'addFrame',
                  id: anchor.vo.id,
                  frameNo,
                });
              }
              handleClose();
            }}>
            {t('menu_item-label__addFromFrame')}
          </MenuItem>
        )}
        {multiFrame && (
          <MenuItem
            disabled={disabledRemoveFrame}
            onClick={() => {
              if (anchor) {
                onUpdateTaskAnnotation({
                  type: 'removeFrame',
                  id: anchor.vo.id,
                  frameNo,
                });
              }
              handleClose();
            }}>
            {t('menu_item-label__removeFromFrame')}
          </MenuItem>
        )}
        <MenuItem
          disabled={disabledRemoveAll}
          onClick={() => {
            if (anchor) {
              onUpdateTaskAnnotation({ type: 'removeAll', id: anchor.vo.id });
              onClickItem(anchor.vo, 'remove');
            }
            handleClose();
          }}>
          {t('menu_item-label__removeAll')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default InstanceList;
