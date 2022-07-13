import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import DraggablePopover from '../../../components/draggable-popover';
import FLTextField from '../../../components/fields/fl-text-field';
import CameraCalibrationStore from '../../../stores/camera-calibration-store';

/**
 * under developing. It's for debug tool.
 * @returns
 */
const CalibrationEditDialog: FC = () => {
  const { open, form, dispatchForm } = CameraCalibrationStore.useContainer();
  return (
    <DraggablePopover open={open}>
      <Box component="div" width={180} p={2}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <FLTextField
              label="Fov Angle (画角)"
              form={['fixFov', form, dispatchForm]}
              inputType="number"
            />
          </Grid>
        </Grid>
      </Box>
    </DraggablePopover>
  );
};
export default CalibrationEditDialog;
