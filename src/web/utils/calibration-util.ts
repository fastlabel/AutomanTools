import { TaskCalibrationVO } from "../types/vo";


type CalibrationYaml = {
    CameraExtrinsicMat: any;
    CameraMat: any;
    DistCoeff: any;
    ImageSize: [width: number, height: number];
};

const convertArray = (item: { cols: number, rows: number, dt: string, data: number[] }): any => {
    const { cols, rows, data } = item;
    const len = data.length;
    const result = [];
    for (let i = 0; i < len;) {
        const end = i + rows;
        result.push(data.slice(i, end));
        i = end;
    }
    return result;
}

export const CalibrationUtil = {
    convertYamlToVo: (yamlObj: CalibrationYaml): TaskCalibrationVO => {
        return {
            cameraExtrinsicMat: convertArray(yamlObj.CameraExtrinsicMat),
            cameraMat: convertArray(yamlObj.CameraMat),
            distCoeff: convertArray(yamlObj.DistCoeff),
            imageSize: yamlObj.ImageSize,
        };
    }
};