import { ReferenceTargetUtil } from '@fl-file/reference-target-util';
import { ApplicationConst } from '@fl-three-editor/application/const';
import { ProjectRepository } from '@fl-three-editor/repositories/project-repository';
import { ProjectType } from '@fl-three-editor/types/const';
import {
  AnnotationClassVO,
  TaskAnnotationVO,
  TaskFrameVO,
  TaskROMVO,
} from '@fl-three-editor/types/vo';
import { CalibrationUtil } from '@fl-three-editor/utils/calibration-util';
import PcdUtil from '@fl-three-editor/utils/pcd-util';
import { TaskAnnotationUtil } from '@fl-three-editor/utils/task-annotation-util';
import { LoaderUtils } from 'three';

const workspaceApi = window.workspace;

const arrayBufferToDataUrl = (extension: string, buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const dataUrl = `data:image/${extension.toLowerCase()};base64,${window.btoa(
    binary
  )}`;
  return dataUrl;
};

export const useProjectFsRepository = (
  workspaceContext: any
): ProjectRepository => {
  const saveFrameTaskAnnotations = (vo: TaskAnnotationVO[]): Promise<void> => {
    const originVos = vo.map(TaskAnnotationUtil.formSaveJson);
    return new Promise((resolve, reject) => {
      const wkDir = workspaceContext.workspaceFolder;
      workspaceApi
        .save({
          wkDir,
          query: {
            output: {
              annotation_data: { method: 'json', resource: originVos },
            },
          },
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  };
  return {
    create(vo: {
      projectId: string;
      type: ProjectType;
      targets: File[];
    }): Promise<{ projectId: string; errorCode?: string }> {
      const targetQuery = ReferenceTargetUtil.reduceFiles(
        vo.type,
        vo.targets,
        (file, extension) => ({
          method: 'copy',
          fromPath: file.path,
          extension,
        }),
        (jsonObj) => ({
          method: 'json',
          resource: jsonObj,
        })
      );
      return new Promise((resolve, reject) => {
        const wkDir = workspaceContext.workspaceFolder;
        workspaceApi
          .checkWorkspace({ wkDir })
          .then((res) => {
            if (!res.valid) {
              resolve({ projectId: vo.projectId, errorCode: res.code });
              return;
            }
            // should save before check dir
            workspaceApi
              .save({
                wkDir,
                query: {
                  meta: {
                    project: {
                      method: 'json',
                      resource: {
                        projectId: vo.projectId,
                        version: ApplicationConst.version,
                      },
                    },
                    annotation_classes: { method: 'json', resource: [] },
                  },
                  target: targetQuery,
                  output: {
                    annotation_data: { method: 'json', resource: [] },
                  },
                },
              })
              .then(() => resolve({ projectId: vo.projectId }))
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      });
    },
    load(
      projectId: string,
      taskId?: string,
      frameNo?: string
    ): Promise<{ taskROM: TaskROMVO; taskAnnotations: TaskAnnotationVO[] }> {
      return new Promise((resolve, reject) => {
        const wkDir = workspaceContext.workspaceFolder;
        workspaceApi
          .load({
            wkDir,
            query: {
              meta: {
                project: true,
                annotation_classes: true,
              },
              target: {
                target_info: true,
                calibration: 'folder',
              },
              output: {
                annotation_data: true,
              },
            },
          })
          .then((res) => {
            const project = res.meta?.project;
            const annotationClasses = res.meta
              ?.annotation_classes as AnnotationClassVO[];
            const targetInfo = res.target?.target_info;
            const taskROM = { ...project, ...targetInfo, annotationClasses };
            const taskAnnotations = TaskAnnotationUtil.merge(
              res.output?.annotation_data,
              annotationClasses
            );
            const calibrationYamlObjs = res.target?.calibration;
            if (calibrationYamlObjs) {
              const calibrations = Object.keys(calibrationYamlObjs).reduce<any>(
                (r, key) => {
                  const obj = calibrationYamlObjs[key];
                  r[key] = CalibrationUtil.convertYamlToVo(obj);
                  return r;
                },
                {}
              );
              taskROM.calibrations = calibrations;
            }
            resolve({ taskROM, taskAnnotations });
          })
          .catch((err) => reject(err));
      });
    },
    loadAnnotationClasses(
      projectId: string
    ): Promise<{ annotationClasses: AnnotationClassVO[] }> {
      return new Promise((resolve, reject) => {
        const wkDir = workspaceContext.workspaceFolder;
        workspaceApi
          .load({
            wkDir,
            query: {
              meta: {
                annotation_classes: true,
              },
            },
          })
          .then((res) => {
            resolve({ annotationClasses: res.meta?.annotation_classes });
          })
          .catch((err) => reject(err));
      });
    },
    saveAnnotationClasses(vo: {
      annotationClasses: AnnotationClassVO[];
    }): Promise<void> {
      return new Promise((resolve, reject) => {
        const wkDir = workspaceContext.workspaceFolder;
        workspaceApi
          .save({
            wkDir,
            query: {
              meta: {
                annotation_classes: {
                  method: 'json',
                  resource: vo.annotationClasses,
                },
              },
            },
          })
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    },
    loadFrameResource(
      projectId: string,
      taskId: string,
      frameNo: string,
      pcdTopicId: string,
      imageTopics?: { [topicId: string]: string }
    ): Promise<TaskFrameVO> {
      const _imageTopics = imageTopics || {};
      return new Promise((resolve, reject) => {
        const wkDir = workspaceContext.workspaceFolder;
        workspaceApi
          .load({
            wkDir,
            query: {
              target: {
                [frameNo]: Object.assign({ [pcdTopicId]: 'pcd' }, _imageTopics),
              },
            },
          })
          .then((res) => {
            if (!res.target) return;
            const frameDir = res.target[frameNo];
            const data = frameDir[pcdTopicId];
            const textData = LoaderUtils.decodeText(new Uint8Array(data));
            const pcdResource = PcdUtil.parse(data, textData, pcdTopicId);
            const imageResources = Object.keys(_imageTopics).reduce<any>(
              (r, k) => {
                r[k] = arrayBufferToDataUrl(_imageTopics[k], frameDir[k]);
                return r;
              },
              {}
            );
            resolve({ currentFrame: frameNo, pcdResource, imageResources });
          })
          .catch((err) => reject(err));
      });
    },
    saveFrameTaskAnnotations,
    exportTaskAnnotations(
      vo: TaskAnnotationVO[]
    ): Promise<{ status?: boolean; path?: string; message?: string }> {
      saveFrameTaskAnnotations(vo);
      const date = new Date();
      const yyyy = `${date.getFullYear()}`;
      const MM = `0${date.getMonth() + 1}`.slice(-2);
      const dd = `0${date.getDate()}`.slice(-2);
      const HH = `0${date.getHours()}`.slice(-2);
      const mm = `0${date.getMinutes()}`.slice(-2);
      const ss = `0${date.getSeconds()}`.slice(-2);
      const ms = `00${date.getMilliseconds()}`.slice(-3);
      const fileName = `${workspaceContext.folderName}_${yyyy}${MM}${dd}${HH}${mm}${ss}${ms}.json`;
      return workspaceApi.export({ fileName, dataJson: vo });
    },
  };
};
