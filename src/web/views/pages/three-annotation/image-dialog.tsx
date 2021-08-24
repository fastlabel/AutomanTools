import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import React, { FC, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import TaskStore from '../../../stores/task-store';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            position: 'relative'
        },
        contentImage: {
            width: 560,
            height: 'auto'
        },
        popoverPaper: {
            maxWidth: 'initial',
            maxHeight: 'initial'
        },
        prevButton: {
            display: 'flex',
            position: 'absolute',
            height: '100%',
            alignItems: 'center',
            top: 0,
            left: 0
        },
        nextButton: {
            display: 'flex',
            position: 'absolute',
            height: '100%',
            alignItems: 'center',
            top: 0,
            right: 0
        }
    }));

type Props = {
};

type Position = {
    xRate: number;
    yRate: number;
};

const ImagePopover: FC<Props> = () => {
    const styles = useStyles();
    const popoverRef = useRef<any>(undefined);

    const { topicImageDialog, moveTopicImage } = TaskStore.useContainer();

    useEffect(() => {
        if (popoverRef.current) {
            popoverRef.current.style.inset = '';
            popoverRef.current.style.top = '0px';
        }
    }, [popoverRef.current, topicImageDialog.open])

    const [currentPosition, setCurrentPosition] = useState<Position>({
        xRate: 0,
        yRate: 0
    });

    const onDrag = (e: DraggableEvent, data: DraggableData) => {
        setCurrentPosition({ xRate: data.lastX, yRate: data.lastY });
    };
    return (
        <Draggable
            position={{
                x: currentPosition.xRate,
                y: currentPosition.yRate
            }}
            onDrag={onDrag}
        >
            <Popover
                ref={popoverRef}
                hideBackdrop={true}
                disablePortal={true}
                anchorReference="anchorPosition"
                anchorPosition={{ top: 0, left: 0 }}
                PaperProps={({ className: styles.popoverPaper })}
                open={topicImageDialog.open}>

                <Box className={styles.content}>
                    {topicImageDialog.hasPrev && <Box className={styles.prevButton} m={0}>
                        <Box height={48}>
                            <IconButton aria-label="image-popover-prev" onClick={() => moveTopicImage('prev')}>
                                <ArrowBackIosOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>}
                    <Box style={({ cursor: 'move' })}>
                        <img className={styles.contentImage} unselectable="on" draggable="false" src={topicImageDialog.currentImageData} />
                    </Box>
                    {topicImageDialog.hasNext && <Box className={styles.nextButton} m={0}>
                        <Box height={48}>
                            <IconButton aria-label="image-popover-next" onClick={() => moveTopicImage('next')} >
                                <ArrowForwardIosOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>}
                </Box>
            </Popover>
        </Draggable>
    );
};

export default ImagePopover;