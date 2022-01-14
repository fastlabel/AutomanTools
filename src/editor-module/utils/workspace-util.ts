import { TFunction } from 'react-i18next';
import { ProjectType } from '../types/const';

const TargetItemTypes = [
  { key: ProjectType.pcd_only, label: 'c_select_item-label__pcd_only' },
  { key: ProjectType.pcd_image, label: 'c_select_item-label__pcd_image' },
  {
    key: ProjectType.pcd_image_frames,
    label: 'c_select_item-label__pcd_image_frames',
  },
];

const CONST_FILE_PROPS: any = {
  pcd_only: {
    descriptionKey: {
      main: 'c_file-pcd_only__description_main',
      sub: 'c_file-pcd_only__description_sub',
      btn: 'c_file-pcd_only__description_btn',
      btnUpdate: 'c_file-pcd_only__description_btnUpdate',
    },
    accept: '.pcd',
    maxFiles: 1,
  },
  pcd_image: {
    descriptionKey: {
      main: 'c_file-pcd_image__description_main',
      sub: 'c_file-pcd_image__description_sub',
      btn: 'c_file-pcd_image__description_btn',
      btnUpdate: 'c_file-pcd_image__description_btnUpdate',
    },
    accept: ['.pcd', 'image/jpeg', 'image/png', '.yaml'],
  },
  pcd_image_frames: {
    descriptionKey: {
      main: 'c_file-pcd_image_frames__description_main',
      sub: 'c_file-pcd_image_frames__description_sub',
      btn: 'c_file-pcd_image_frames__description_btn',
      btnUpdate: 'c_file-pcd_image_frames__description_btnUpdate',
    },
    mode: 'folder',
  },
};

export const WorkspaceUtil = {
  targetItemTypes: (t: TFunction<'translation'>) => {
    return TargetItemTypes.map((item) => {
      const r = { ...item };
      r.label = t(r.label);
      return r;
    });
  },
  folderContentsProps: (t: TFunction<'translation'>, typeValue: string) => {
    const fileProps = CONST_FILE_PROPS[typeValue];
    fileProps.description = {};
    fileProps.description.main = t(fileProps.descriptionKey.main);
    fileProps.description.sub = t(fileProps.descriptionKey.sub);
    fileProps.description.btn = t(fileProps.descriptionKey.btn);
    fileProps.description.btnUpdate = t(fileProps.descriptionKey.btnUpdate);
    return fileProps;
  },
};
