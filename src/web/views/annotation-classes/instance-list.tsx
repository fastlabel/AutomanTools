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
import { ClassItem } from "./class-list";

export type InstanceItem = {
    id: string;
    classItem: ClassItem;
};

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
    instances: InstanceItem[],
    invisibleClasses?: Set<string>;
    selectedItems?: Set<string>;
    onClickItem?: (item: InstanceItem) => void;
    onClickToggleInvisible?: (item: InstanceItem, visible: boolean) => void;
};

const InstanceList: FC<Props> = ({ instances, invisibleClasses, selectedItems, onClickItem, onClickToggleInvisible }) => {
    const styleClasses = useStyles();
    const getClassTagStyle = (type: AnnotationType): any => {
        return styleClasses.markCuboid;
    };

    return (
        <List component="div" disablePadding>
            {instances.map((item, index) => {
                const hidden = invisibleClasses?.has(item.id);
                const selected = selectedItems?.has(item.id);
                const classItem = item.classItem;
                return (
                    <ListItem key={index} button dense selected={selected} onClick={() => onClickItem && onClickItem(item)}>
                        <span style={{ backgroundColor: classItem.color }} className={getClassTagStyle(classItem.type)} />
                        <ListItemText primary={classItem.title} className={styleClasses.flexGrow} />
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