import { Collapse, createStyles, makeStyles, Theme } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import React, { FC, useMemo } from 'react';
import FLTextField from '../../components/fields/fl-text-field';
import { FormState } from '../../components/fields/type';
import { AnnotationType } from '../../types/const';
import { TaskAnnotationVO } from '../../types/vo';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flexGrow: {
      flexGrow: 1,
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
  editingTaskAnnotation?: TaskAnnotationVO;
  invisibleClasses?: Set<string>;
  selectedItems?: Set<string>;
  onClickItem?: (
    item: TaskAnnotationVO,
    mode?: 'add' | 'remove' | 'single' | 'clear'
  ) => void;
  onClickToggleInvisible?: (item: TaskAnnotationVO, visible: boolean) => void;
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
  editingTaskAnnotation,
  invisibleClasses,
  selectedItems,
  onClickItem = (f) => f,
  onClickToggleInvisible,
}) => {
  const styleClasses = useStyles();
  const getClassTagStyle = (type: AnnotationType): any => {
    return styleClasses.markCuboid;
  };

  const collapseContent = useMemo(
    () => (item: TaskAnnotationVO) => {
      const [
        positionX,
        positionY,
        positionZ,
        rotationX,
        rotationY,
        rotationZ,
        width,
        height,
        deps,
      ] = item.points[frameNo];
      const data = {
        positionX,
        positionY,
        positionZ,
        rotationX,
        rotationY,
        rotationZ,
        width,
        height,
        deps,
      };
      const formObj: FormState<any> = { data };
      return (
        <Collapse in={true} timeout={100} unmountOnExit>
          <List disablePadding>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'座標 X'}
                form={['positionX', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'座標 Y'}
                form={['positionY', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'座標 Z'}
                form={['positionZ', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'回転 X'}
                form={['rotationX', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'回転 Y'}
                form={['rotationY', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'回転 Z'}
                form={['rotationZ', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'幅'}
                form={['width', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'高さ'}
                form={['height', formObj]}
              />
            </ListItem>
            <ListItem dense>
              <FLTextField
                mode="list"
                readonly={true}
                label={'長さ'}
                form={['deps', formObj]}
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
        const selected = selectedItems?.has(item.id) === true;
        const hidden = invisibleClasses?.has(item.id);

        return (
          <React.Fragment key={item.id}>
            <ListItem
              button
              dense
              selected={selected}
              onClick={(event) =>
                onClickItem(item, resolveMode(selected, event))
              }>
              <span
                style={{ backgroundColor: item.color }}
                className={getClassTagStyle(item.type)}
              />
              <ListItemText
                primary={item.title}
                className={styleClasses.flexGrow}
              />
              {selected ? (
                <ExpandLess color="action" />
              ) : (
                <ExpandMore color="action" />
              )}
              {onClickToggleInvisible ? (
                <ListItemSecondaryAction>
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
                </ListItemSecondaryAction>
              ) : undefined}
            </ListItem>
            {content && content(item)}
          </React.Fragment>
        );
      },
    [invisibleClasses, selectedItems]
  );

  return (
    <List component="div" disablePadding>
      {selectedItems?.size === 1 && editingTaskAnnotation
        ? listItemRenderer(editingTaskAnnotation, collapseContent)
        : instances.map((item, index) => listItemRenderer(item))}
    </List>
  );
};

export default InstanceList;
