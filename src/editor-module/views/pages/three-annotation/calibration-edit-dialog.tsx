import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import React, { FC } from 'react';
import DraggablePopover from '../../../components/draggable-popover';
import FLTextField from '../../../components/fields/fl-text-field';
import CameraCalibrationStore from '../../../stores/camera-calibration-store';

type Props = {};

const CalibrationEditDialog: FC<Props> = () => {
  const { open, form, dispatchForm } = CameraCalibrationStore.useContainer();
  return (
    <DraggablePopover open={open}>
      <Box width={180} p={2}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <FLTextField
              label="画角"
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
