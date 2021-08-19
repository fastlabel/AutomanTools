import { createStyles, makeStyles, Theme } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import React, { FC } from "react";
import { AnnotationType } from "../../types/const";
import { TaskAnnotationVO } from "../../types/vo";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        flexGrow: {
            flexGrow: 1,
        },
        markCuboid: {
            marginRight: theme.spacing(1),
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#ffffff",
            boxSizing: "border-box",
            minWidth: theme.spacing(2),
            minHeight: theme.spacing(2),
        }
    })
);

type Props = {
    instances: TaskAnnotationVO[],
    invisibleClasses?: Set<string>;
    selectedItems?: Set<string>;
    onClickItem?: (item: TaskAnnotationVO, mode?: 'add' | 'remove' | 'single') => void;
    onClickToggleInvisible?: (item: TaskAnnotationVO, visible: boolean) => void;
};

const resolveMode = (selected: boolean, event: any) => {
    if (event.ctrlKey) {
        return selected ? 'remove' : 'add';
    }
    return 'single';
};

const InstanceList: FC<Props> = ({ instances, invisibleClasses, selectedItems, onClickItem = f => f, onClickToggleInvisible }) => {
    const styleClasses = useStyles();
    const getClassTagStyle = (type: AnnotationType): any => {
        return styleClasses.markCuboid;
    };

    return (
        <List component="div" disablePadding>
            {instances.map((item, index) => {
                const hidden = invisibleClasses?.has(item.id);
                const selected = !!selectedItems?.has(item.id);
                return (
                    <ListItem key={index} button dense selected={selected} onClick={(event) => onClickItem(item, resolveMode(selected, event))}>
                        <span style={{ backgroundColor: item.color }} className={getClassTagStyle(item.type)} />
                        <ListItemText primary={item.title} className={styleClasses.flexGrow} />
                        {selected ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
                        {onClickToggleInvisible ?
                            <ListItemSecondaryAction>
                                <IconButton color="default" size="small" onClick={() => onClickToggleInvisible(item, false)}>
                                    {hidden ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
                                </IconButton>
                            </ListItemSecondaryAction> : undefined
                        }
                    </ListItem>)
            })}
        </List>
    );
};

export default InstanceList;