import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

export type Mark = 'Circle' | 'Check' | 'CheckCircle';

export const FRAME_BUTTON_WIDTH = 18;
export const FRAME_BUTTON_MIN_WIDTH = 14;

type Props = {
  frameIndex: number;
  onClick: (frame: number) => void;
  onDoubleClick: (frame: number) => void;
  mark?: Mark;
} & StylesProps;

type StylesProps = {
  color: string;
  isActive: boolean;
  outlined: boolean;
};

const useStyles = makeStyles<Theme, StylesProps>(() =>
  createStyles({
    button: {
      width: '100%',
      minWidth: FRAME_BUTTON_WIDTH,
      height: 56,
      cursor: 'pointer',
      flex: '1 1 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      border: 0,
      '&:focus': {
        outline: 0,
      },
    },
    buttonInner: {
      width: '70%',
      minWidth: FRAME_BUTTON_MIN_WIDTH,
      height: ({ isActive }) => (isActive ? 56 : 28),
      backgroundColor: ({ color }) => {
        if (color === 'blue') {
          return 'rgb(79, 143, 240)';
        } else if (color === 'lightBlue') {
          return 'rgb(153, 200, 255)';
        } else if (color === 'gray') {
          return 'rgb(189, 189, 189)';
        } else {
          return color;
        }
      },
      '&:hover': {
        height: ({ isActive }) => (isActive ? 56 : 34),
      },
      border: ({ outlined }) => (outlined ? '2px solid black' : ''),
    },
    markContainer: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mark: {
      fontSize: '0.75rem',
      color: '#FFFFFF',
    },
  })
);

const FrameButton: React.FC<Props> = ({
  frameIndex,
  onClick,
  onDoubleClick,
  color,
  isActive,
  outlined,
  mark,
}) => {
  const styles = useStyles({ color, isActive, outlined });
  const renderMark = (mark: Mark) => {
    switch (mark) {
      case 'Circle':
        return (
          <svg width={12} height={12} viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} fill="#FFF"></circle>
          </svg>
        );
      case 'Check':
        return <CheckIcon className={styles.mark} />;
      case 'CheckCircle':
        return <CheckCircleIcon className={styles.mark} />;
    }
  };
  return (
    <Tooltip title={frameIndex} placement="top">
      <button
        tabIndex={-1}
        className={styles.button}
        onClick={() => onClick(frameIndex)}
        onDoubleClick={() => onDoubleClick(frameIndex)}>
        <div className={styles.buttonInner}>
          {mark ? (
            <Box className={styles.markContainer}>{renderMark(mark)}</Box>
          ) : (
            ''
          )}
        </div>
      </button>
    </Tooltip>
  );
};

export default FrameButton;
