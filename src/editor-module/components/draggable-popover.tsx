import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      position: 'relative',
    },
    popoverPaper: {
      maxWidth: 'initial',
      maxHeight: 'initial',
    },
  })
);

type Props = {
  handle?: string;
  open: boolean;
};

type Position = {
  xRate: number;
  yRate: number;
};

const DraggablePopover: FC<Props> = ({ handle, open, children }) => {
  const styles = useStyles();
  const popoverRef = useRef<any>(undefined);

  const [currentPosition, setCurrentPosition] = useState<Position>({
    xRate: 0,
    yRate: 0,
  });

  const onDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
    const xRate = data.lastX < 0 ? 0 : data.lastX;
    const yRate = data.lastY < -38 ? -38 : data.lastY;
    setCurrentPosition({ xRate, yRate });
  }, []);

  useEffect(() => {
    if (popoverRef.current && open) {
      popoverRef.current.style.inset = '';
      popoverRef.current.style.top = '60px';
      popoverRef.current.style.left = '-16px';
    }
  }, [popoverRef, open]);

  return (
    <Draggable
      handle={handle}
      position={{
        x: currentPosition.xRate,
        y: currentPosition.yRate,
      }}
      onDrag={onDrag}>
      <Popover
        ref={popoverRef}
        hideBackdrop={true}
        disablePortal={true}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 0, left: 0 }}
        PaperProps={{ className: styles.popoverPaper }}
        open={open}>
        <Box component="div" className={styles.content}>
          {children}
        </Box>
      </Popover>
    </Draggable>
  );
};
export default DraggablePopover;
