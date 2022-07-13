import { Reducer, useEffect, useMemo, useReducer, useState } from 'react';
import { Matrix4, PerspectiveCamera } from 'three';
import { createContainer } from 'unstated-next';
import { FormUtil } from '../components/fields/form-util';
import { FormAction, FormState } from '../components/fields/type';
import { CameraInternal, TaskCalibrationVO } from '../types/vo';

export type CameraCalibration = {
  fixFov: number;
};

const flipMatrix = new Matrix4();
flipMatrix.set(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

const formReducer: Reducer<FormState<CameraCalibration>, FormAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'change':
      // TODO validation
      return {
        data: FormUtil.update(action.name, action.value, state.data),
        helper: state.helper,
      };
    case 'init':
      return { data: action.data, helper: {} };
  }
};

const useCameraCalibration = () => {
  const [open, setOpen] = useState(false);
  const [calibration, updateCalibration] = useState<TaskCalibrationVO>();

  const [cameraInternal, updateCameraInternal] = useState<CameraInternal>();

  const [form, dispatchForm] = useReducer(formReducer, {
    data: { fixFov: 0 },
    helper: {},
  });

  useEffect(() => {
    if (!calibration) {
      return;
    }
    const mat = calibration.cameraMat;
    const cameraMatrix = new Matrix4();
    cameraMatrix.set(...mat[0], 0, ...mat[1], 0, ...mat[2], 0, 0, 0, 0, 1);
    const cameraMatrixT = cameraMatrix.clone().transpose();

    const [width, height] = calibration.imageSize;
    const fy = cameraMatrixT.elements[5];
    const cx = cameraMatrixT.elements[2];
    const cy = cameraMatrixT.elements[6];
    const fullWidth = cx * 2;
    const fullHeight = cy * 2;

    const offsetX = cx - width / 2;
    const offsetY = cy - height / 2;

    const fov = (2 * Math.atan(fullHeight / (2 * fy)) * 180) / Math.PI;
    const distance = 1000;

    updateCameraInternal((pre) => ({
      ...pre,
      width,
      height,
      fy,
      fov: form.data.fixFov || fov,
      distance,
      fullWidth,
      fullHeight,
      offsetX,
      offsetY,
    }));
  }, [calibration]);

  useEffect(() => {
    updateCameraInternal((pre) => {
      if (pre) {
        const newState = { ...pre, fov: form.data.fixFov };
        console.log(newState);
        return newState;
      }
      return pre;
    });
  }, [form]);

  const calibrationCamera = useMemo(() => {
    if (!cameraInternal || !calibration) {
      return undefined;
    }
    const cameraExtrinsicMatrix = new Matrix4();
    const extrinsic = calibration.cameraExtrinsicMat;
    cameraExtrinsicMatrix.set(
      ...extrinsic[0],
      ...extrinsic[1],
      ...extrinsic[2],
      ...extrinsic[3]
    );
    // Flip the calibration information along with all axes.
    const flipMatrix = new Matrix4();
    flipMatrix.set(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

    // NOTE: THREE.Matrix4.elements contains matrices in column-major order, but not row-major one.
    //       So, we need the transposed matrix to get the elements in row-major order.
    const cameraExtrinsicMatrixFlipped = flipMatrix.premultiply(
      cameraExtrinsicMatrix
    );
    const cameraExtrinsicMatrixFlippedT = cameraExtrinsicMatrixFlipped
      .clone()
      .transpose();

    const imageCamera = new PerspectiveCamera(
      cameraInternal.fov,
      // cameraInternal.fullWidth / cameraInternal.fullHeight,
      cameraInternal.width / cameraInternal.height,
      1,
      cameraInternal.distance
    );
    // imageCamera.setViewOffset(
    //     cameraInternal.fullWidth,
    //     cameraInternal.fullHeight,
    //     cameraInternal.offsetX,
    //     cameraInternal.offsetY,
    //     cameraInternal.width,
    //     cameraInternal.height
    // );
    const [
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44,
    ] = cameraExtrinsicMatrixFlippedT.elements;
    imageCamera.matrix.set(
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44
    );
    imageCamera.matrixWorld.copy(imageCamera.matrix);
    imageCamera.updateProjectionMatrix();
    imageCamera.matrixAutoUpdate = false;
    return imageCamera;
  }, [cameraInternal, calibration]);

  return {
    open,
    setOpen,
    calibrationCamera,
    cameraInternal,
    updateCalibration,
    form,
    dispatchForm,
  };
};
export default createContainer(useCameraCalibration);
