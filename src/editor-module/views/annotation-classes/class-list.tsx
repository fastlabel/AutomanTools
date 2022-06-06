import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import React, { FC } from 'react';
import { AnnotationType } from '../../types/const';
import { AnnotationClassVO } from '../../types/vo';

const useStyles = makeStyles(() =>
  createStyles({
    flexGrow: {
      flexGrow: 1,
    },
    hotKey: {
      fontSize: '0.5rem',
      height: 20,
      borderRadius: 4,
      marginRight: theme.spacing(1),
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
  classes: AnnotationClassVO[];
  invisibleClasses?: Set<string>;
  selectedId?: string;
  onClickItem?: (item: AnnotationClassVO) => void;
  onClickToggleInvisible?: (item: AnnotationClassVO, visible: boolean) => void;
};

const ClassList: FC<Props> = ({
  classes,
  invisibleClasses,
  selectedId,
  onClickItem,
  onClickToggleInvisible,
}) => {
  const styleClasses = useStyles();
  const getClassTagStyle = (type: AnnotationType): any => {
    return styleClasses.markCuboid;
  };
  return (
    <List component="div" disablePadding>
      {classes.map((item, index) => {
        const hidden = invisibleClasses?.has(item.id);
        return (
          <ListItem
            key={index}
            button
            dense
            selected={selectedId === item.id}
            onClick={() => onClickItem && onClickItem(item)}>
            <span
              style={{ backgroundColor: item.color }}
              className={getClassTagStyle(item.type)}
            />
            <ListItemText
              primary={item.title}
              className={styleClasses.flexGrow}
            />
            {index < 9 ? (
              <Chip
                label={index + 1}
                disabled
                variant="outlined"
                size="small"
                className={styleClasses.hotKey}
              />
            ) : null}
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
        );
      })}
    </List>
  );
};

export default ClassList;
