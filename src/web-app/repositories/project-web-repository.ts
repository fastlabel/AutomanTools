import { ReferenceTargetUtil } from '@fl-file/reference-target-util';
import { ProjectRepository } from '@fl-three-editor/repositories/project-repository';
import { ProjectType } from '@fl-three-editor/types/const';
import {
  AnnotationClassVO,
  TaskAnnotationOriginVO,
  TaskAnnotationVO,
  TaskFrameVO,
  TaskROMVO,
} from '@fl-three-editor/types/vo';
import { CalibrationUtil } from '@fl-three-editor/utils/calibration-util';
import PcdUtil from '@fl-three-editor/utils/pcd-util';
import { TaskAnnotationUtil } from '@fl-three-editor/utils/task-annotation-util';
import { useState } from 'react';
import { LoaderUtils } from 'three';
import YAML from 'yaml';

type LocalWorkspace = {
  projectId: string;
  type: ProjectType;
  target: any;
};

const readFile = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsDataURL = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
};

const readFileAsText = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.readAsText(file);
  });
};

const handleDownload = (name: string, content: Blob) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = URL.createObjectURL(content);
  link.click();
  URL.revokeObjectURL(link.href);
};

export type ProjectWebRepository = ProjectRepository & {
  setEditTarget(
    annotationClasses: AnnotationClassVO[],
    taskAnnotations: TaskAnnotationOriginVO[]
  ): void;
};

export const useProjectWebRepository = (): ProjectWebRepository => {
  const [local, setLocal] = useState<LocalWorkspace>();
  const [annotationClasses, setAnnotationClasses] = useState<
    AnnotationClassVO[]
  >([]);
  const [taskAnnotations, setTaskAnnotations] = useState<TaskAnnotationVO[]>(
    []
  );
  return {
    create(vo: {
      projectId: string;
      type: ProjectType;
      targets: File[];
    }): Promise<{ projectId: string }> {
      const projectId = vo.projectId;
      const target = ReferenceTargetUtil.reduceFiles(vo.type, vo.targets);
      setLocal({ projectId, type: vo.type, target });
      return new Promise((resolve, reject) => {
        // make cached object
        // there are 2 case [add and edit]
        resolve({ projectId });
      });
    },
    load(
      projectId: string,
      taskId: string,
      frameNo?: string
    ): Promise<{ taskROM: TaskROMVO; taskAnnotations: TaskAnnotationVO[] }> {
      return new Promise((resolve, reject) => {
        if (local) {
          // load classes from cached object
          const taskROM: TaskROMVO = {
            projectId: local.projectId,
            annotationClasses: [],
            taskId: '',
            ...local.target.target_info,
          };
          taskROM.annotationClasses = annotationClasses;
          const calibrationYamlObjs = local.target.calibration;
          if (!calibrationYamlObjs) {
            resolve({ taskROM, taskAnnotations });
            return;
          }
          const calibrationIds = Object.keys(calibrationYamlObjs);
          Promise.all(
            calibrationIds.map((id) => readFileAsText(calibrationYamlObjs[id]))
          ).then((res) => {
            const calibrations = calibrationIds.reduce<any>((r, key, index) => {
              r[key] = CalibrationUtil.convertYamlToVo(YAML.parse(res[index]));
              return r;
            }, {});
            taskROM.calibrations = calibrations;
            resolve({ taskROM, taskAnnotations });
          });
        } else {
          reject('illegal state even call create!!');
        }
      });
    },
    loadAnnotationClasses(
      projectId: string
    ): Promise<{ annotationClasses: AnnotationClassVO[] }> {
      return new Promise((resolve, reject) => {
        // load classes from cached object
        resolve({ annotationClasses });
      });
    },
    saveAnnotationClasses(vo: {
      annotationClasses: AnnotationClassVO[];
    }): Promise<void> {
      return new Promise((resolve, reject) => {
        setAnnotationClasses(vo.annotationClasses);
        // update cached object
        resolve();
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
        if (!local) {
          reject('illegal state even call create!!');
          return;
        }
        // load classes from cached object
        const frameDir = local.target[frameNo];
        const imageTopicIds = Object.keys(_imageTopics);
        readFile(frameDir[pcdTopicId])
          .then((data) => {
            const pcdResource = PcdUtil.parse(
              data,
              LoaderUtils.decodeText(new Uint8Array(data)),
              pcdTopicId
            );
            if (imageTopicIds.length === 0) {
              resolve({
                currentFrame: frameNo,
                pcdResource,
                imageResources: {},
              });
              return;
            }
            Promise.all(
              imageTopicIds.map((key) => readFileAsDataURL(frameDir[key]))
            )
              .then((images) => {
                const imageResources = imageTopicIds.reduce<any>(
                  (r, k, index) => {
                    r[k] = images[index];
                    return r;
                  },
                  {}
                );
                resolve({ currentFrame: frameNo, pcdResource, imageResources });
              })
              .catch((error) => reject(error));
          })
          .catch((error) => reject(error));
      });
    },
    saveFrameTaskAnnotations(vo: TaskAnnotationVO[]): Promise<void> {
      return new Promise((resolve, reject) => {
        // download file [annotation and classes].
        const timestamp = ReferenceTargetUtil.timestamp();
        const originVos = vo.map(TaskAnnotationUtil.formSaveJson);
        handleDownload(
          `${timestamp}_annotationClasses.json`,
          new Blob([JSON.stringify(annotationClasses, null, 2)], {
            type: 'application/json',
          })
        );
        handleDownload(
          `${timestamp}_taskAnnotations.json`,
          new Blob([JSON.stringify(originVos, null, 2)], {
            type: 'application/json',
          })
        );
        resolve();
      });
    },
    exportTaskAnnotations(
      vo: TaskAnnotationVO[]
    ): Promise<{ status?: boolean; path?: string; message?: string }> {
      return new Promise((resolve, reject) => {
        // download file [annotation] it same with app-ver.
        const timestamp = ReferenceTargetUtil.timestamp();
        handleDownload(
          `${timestamp}_exportTaskAnnotations.json`,
          new Blob([JSON.stringify(vo, null, 2)], { type: 'application/json' })
        );
        resolve({ status: true, path: '' });
      });
    },
    setEditTarget(
      annotationClasses: AnnotationClassVO[],
      taskAnnotations: TaskAnnotationOriginVO[]
    ) {
      setAnnotationClasses(annotationClasses);
      const annotationMap = annotationClasses.reduce((r, a) => {
        r.set(a.id, a);
        return r;
      }, new Map());
      setTaskAnnotations(
        taskAnnotations.map((t) => {
          const annotationClass = annotationMap.get(t.annotationClassId);
          if (!annotationClass) {
            throw new Error(
              `can't find annotationClass by ${t.annotationClassId}`
            );
          }
          const { type, title, value, color } = annotationClass;
          return { type, title, value, color, ...t };
        })
      );
    },
  };
};
