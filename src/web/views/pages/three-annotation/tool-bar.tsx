import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import FormatShapesOutlinedIcon from '@material-ui/icons/FormatShapesOutlined';
import OpenWithOutlinedIcon from '@material-ui/icons/OpenWithOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import TouchAppOutlinedIcon from '@material-ui/icons/TouchAppOutlined';
import React, { FC, useCallback } from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: () => ({
            marginRight: theme.spacing(1)
        })
    }),
);

type ToolButtonProps = {
    toolTip: string;
    icon: JSX.Element;
    active?: boolean;
};

type Props = {

};

const ThreeToolbar: FC<Props> = () => {
    const classes = useStyles();

    const _ToolButton: FC<ToolButtonProps> = useCallback(({ toolTip, icon, active }) => {
        const classes = useStyles();
        return (
            <Tooltip title={toolTip} arrow>
                <IconButton className={classes.icon} size="small" color={active ? "primary" : "default"}>
                    {icon}
                </IconButton>
            </Tooltip>
        )
    }, []);

    return (
        <Paper>
            <List disablePadding>
                <ListItem dense>
                    <_ToolButton toolTip="" icon={(<OpenWithOutlinedIcon />)} />
                    <_ToolButton toolTip="" icon={(<TouchAppOutlinedIcon />)} />
                    <Box mr={2} />
                    <_ToolButton toolTip="" icon={(<FormatShapesOutlinedIcon />)} />
                    <Box mr={2} />
                    <_ToolButton toolTip="" icon={(<SaveOutlinedIcon />)} />
                </ListItem>
            </List>
        </Paper>);
};

export default ThreeToolbar;