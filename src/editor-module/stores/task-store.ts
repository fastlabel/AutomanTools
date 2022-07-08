import { MathUtil } from '@fl-three-editor/utils/math-util';
import { throttle } from 'lodash';
import { stringify } from 'querystring';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ProjectRepositoryContext } from '../repositories/project-repository';
import {
  AnnotationClassVO,
  TaskAnnotationVO,
  ThreePoints,
  TaskFrameVO,
  TaskROMVO,
  ThreePointsMeta,
} from '../types/vo';
import { TaskAnnotationUtil } from './../utils/task-annotation-util';

export type TaskToolbar = {
  useOrthographicCamera: boolean;
  selectMode: 'control' | 'select';
  showLabel: boolean;
  interpolation: boolean;
};

export type TaskROMState =
  | {
      status: 'none';
    }
  | {
      status: 'loading';
      // [ref] scope=project
      projectId: string;
      // [ref] scope=task
      taskId: string;
    }
  | ({
      status: 'loaded';
    } & TaskROMVO);

export type TaskFrameState =
  | {
      status: 'none';
    }
  | {
      status: 'loading';
      currentFrame: string;
      pcdResource?: any;
      imageResources?: any;
    }
  | ({
      status: 'loaded';
    } & TaskFrameVO);

export type TopicImageDialogState = {
  open: boolean;
  topicIds: string[];
  currentIndex: number;
  currentTopicId?: string;
  currentImageData?: any;
  hasNext?: boolean;
  hasPrev?: boolean;
};

export type TaskEditorState = {
  pageMode: 'threeEdit' | 'classesList';

  editorState:
    | {
        mode: 'neutral';
        selectingAnnotationClass?: null;
        selectingTaskAnnotations: [];
      }
    | {
        mode: 'selecting_annotationClass';
        selectingAnnotationClass: AnnotationClassVO;
        selectingTaskAnnotations: [];
      }
    | {
        mode: 'selecting_taskAnnotation';
        selectingAnnotationClass?: null;
        selectingTaskAnnotations: TaskAnnotationVO[];
      };

  clipboard?: {
    type: 'taskAnnotations';
    items: TaskAnnotationVO[];
  };
};

export type UpdateTaskAnnotationCommand =
  | {
      type: 'addFrame';
      id: string;
      frameNo: string;
    }
  | {
      type: 'removeFrame';
      id: string;
      frameNo: string;
    }
  | {
      type: 'removeAll';
      id: string;
    };

export type UpdateTaskAnnotationsCommand =
  | {
      type: 'objectTransForm';
      frameNo: string;
      changes: {
        [id: string]: {
          points: ThreePoints;
        };
      };
    }
  | {
      type: 'updateAttr';
    }
  | UpdateTaskAnnotationCommand;

const useTask = () => {
  const [isTaskAnnotationUpdated, setIsTaskAnnotationUpdated] =
    useState<boolean>(false);
  const projectRepository = useContext(ProjectRepositoryContext);
  const [pageStatus, _updatePageStatus] = useState<
    'preparing' | 'loading' | 'ready' | 'saving'
  >('preparing');

  const [taskRom, _updateTaskRom] = useState<TaskROMState>({ status: 'none' });

  const [taskAnnotations, _innerUpdateTaskAnnotations] = useState<
    TaskAnnotationVO[]
  >([]);

  const [taskFrame, _updateTaskFrame] = useState<TaskFrameState>({
    status: 'none',
  });

  const [topicImageDialog, _updateTopicImageDialog] =
    useState<TopicImageDialogState>({
      open: false,
      topicIds: [],
      currentIndex: -1,
    });

  const [taskEditor, _updateTaskEditor] = useState<TaskEditorState>({
    pageMode: 'threeEdit',
    editorState: { mode: 'neutral', selectingTaskAnnotations: [] },
  });

  const [editingTaskAnnotation, _setEditingTaskAnnotation] =
    useState<TaskAnnotationVO>();

  const _updateEditingTaskAnnotation = throttle(
    (newVo: TaskAnnotationVO | undefined) => {
      _setEditingTaskAnnotation(newVo);
    },
    500
  );

  const _updateTaskAnnotations = useCallback(
    (taskAnnotations: TaskAnnotationVO[]) => {
      _innerUpdateTaskAnnotations(taskAnnotations);
      if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
        const selectedSet = new Set<string>(
          taskEditor.editorState.selectingTaskAnnotations.map((vo) => vo.id)
        );
        const selectingTaskAnnotations = taskAnnotations.filter((vo) =>
          selectedSet.has(vo.id)
        );
        _updateTaskEditor({
          pageMode: 'threeEdit',
          editorState: {
            mode: 'selecting_taskAnnotation',
            selectingTaskAnnotations,
          },
        });
        if (selectingTaskAnnotations.length === 1) {
          _updateEditingTaskAnnotation(selectingTaskAnnotations[0]);
        }
      }
    },
    [
      _innerUpdateTaskAnnotations,
      _updateEditingTaskAnnotation,
      taskEditor,
      _updateTaskEditor,
    ]
  );

  const _updateTaskAnnotationsFunc = useCallback(
    (func: (prev: TaskAnnotationVO[]) => TaskAnnotationVO[]) => {
      _updateTaskAnnotations(func(taskAnnotations));
    },
    [_updateTaskAnnotations, taskAnnotations]
  );

  const [taskToolBar, updateTaskToolBar] = useState<TaskToolbar>({
    useOrthographicCamera: false,
    selectMode: 'select',
    showLabel: false,
    interpolation: true,
  });

  useEffect(() => {
    if (taskRom.status === 'loading' || taskFrame.status === 'loading') {
      _updatePageStatus('loading');
      return;
    } else if (taskRom.status === 'loaded' && taskFrame.status === 'loaded') {
      _updatePageStatus('ready');
      return;
    } else if (taskRom.status === 'none' || taskFrame.status === 'none') {
      _updatePageStatus('preparing');
      return;
    }
    throw new Error(
      `illegal pageState taskRom:${taskRom.status}, taskFrame:${taskFrame.status}`
    );
  }, [taskRom.status, taskFrame.status]);

  // load frameNo
  useEffect(() => {
    if (taskFrame.status === 'loading' && taskRom.status === 'loaded') {
      const { projectId, taskId, pcdTopicId, imageTopics } = taskRom;
      const frameNo = taskFrame.currentFrame;
      const _imageTopics = imageTopics.reduce((r, t) => {
        r[t.topicId] = t.extension;
        return r;
      }, {} as any);
      projectRepository
        .loadFrameResource(projectId, taskId, frameNo, pcdTopicId, _imageTopics)
        .then((vo) => {
          _updateTaskFrame({ ...vo, status: 'loaded' });
          _updateTopicImageDialog((prev) => {
            if (taskRom.status !== 'loaded') return prev;

            const newState = { ...prev };
            if (newState.currentTopicId) {
              newState.currentImageData =
                vo.imageResources[newState.currentTopicId];
            }
            return newState;
          });
        });
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskFrame]);

  const frameNoSet = useMemo(() => {
    if (taskRom.status !== 'loaded' || taskFrame.status !== 'loaded') {
      return undefined;
    }
    const currentFrameNo = Number(taskFrame.currentFrame);
    return {
      source: taskRom.frames[currentFrameNo - 2],
      dist: taskRom.frames[currentFrameNo - 1],
    };
  }, [taskRom, taskFrame]);

  const resetSelectMode = useCallback(() => {
    _updateTaskEditor((prev) => {
      return {
        ...prev,
        editorState: {
          mode: 'neutral',
          selectingAnnotationClass: undefined,
          selectingTaskAnnotations: [],
        },
      };
    });
  }, [_updateTaskEditor]);

  // Task Store Event
  const open = useCallback(
    (projectId: string, taskId: string, frameNo?: string) => {
      _updateTopicImageDialog({
        open: false,
        topicIds: [],
        currentIndex: -1,
      });
      _updateTaskRom({ status: 'loading', projectId, taskId });
      projectRepository.load(projectId, taskId).then((vo) => {
        _updateTaskRom({ ...vo.taskROM, status: 'loaded' });
        _updateTaskAnnotations(vo.taskAnnotations);
        const _frameNo = frameNo || '0001';
        if (_frameNo) {
          _updateTaskFrame({ status: 'loading', currentFrame: _frameNo });
        }
      });
    },
    [
      projectRepository,
      _updateTaskRom,
      _updateTaskAnnotations,
      _updateTaskFrame,
    ]
  );

  const reopen = useCallback(() => {
    _updateTaskFrame((pre) => ({ ...pre, status: 'none' }));
    setTimeout(() => {
      // workaround reset camera
      _updateTaskFrame((pre: any) => ({ ...pre, status: 'loaded' }));
    }, 50);
  }, [_updateTaskFrame]);

  const fetchAnnotationClasses = useCallback(
    (projectId: string) => {
      // this way will be removed when support project.
      _updatePageStatus('loading');
      projectRepository.loadAnnotationClasses(projectId).then((vo) => {
        _updateTaskRom((prev) => ({
          ...prev,
          annotationClasses: vo.annotationClasses,
        }));
        // TODO update taskAnnotation
        _updateTaskAnnotationsFunc((pre) =>
          TaskAnnotationUtil.merge(pre, vo.annotationClasses)
        );
        _updatePageStatus('ready');
      });
    },
    [
      projectRepository,
      _updateTaskRom,
      _updatePageStatus,
      _updateTaskAnnotationsFunc,
    ]
  );

  const openImageDialog = useCallback(
    (open: boolean) => {
      _updateTopicImageDialog((prev) => {
        if (taskFrame.status !== 'loaded' || taskRom.status !== 'loaded')
          return prev;

        const newState = { ...prev, open };
        if (newState.currentIndex === -1 && taskRom.imageTopics.length > 0) {
          newState.topicIds = taskRom.imageTopics.map((t) => t.topicId);
          newState.currentIndex = 0;
          newState.currentTopicId = newState.topicIds[newState.currentIndex];
        }
        if (newState.currentTopicId) {
          newState.currentImageData =
            taskFrame.imageResources[newState.currentTopicId];
        }
        if (prev.currentIndex !== newState.currentIndex) {
          newState.hasNext =
            newState.currentIndex < newState.topicIds.length - 1;
          newState.hasPrev = newState.currentIndex > 0;
        }
        return newState;
      });
    },
    [taskRom, taskFrame]
  );

  const moveTopicImage = useCallback(
    (command: 'next' | 'prev') => {
      _updateTopicImageDialog((prev) => {
        if (taskFrame.status !== 'loaded') return prev;

        const newState = { ...prev };
        if (command === 'next') {
          newState.currentIndex++;
        } else {
          newState.currentIndex--;
        }
        newState.currentTopicId = newState.topicIds[newState.currentIndex];
        if (
          newState.currentTopicId &&
          (prev.currentTopicId !== newState.currentTopicId ||
            !newState.currentImageData)
        ) {
          newState.currentImageData =
            taskFrame.imageResources[newState.currentTopicId];
        }
        if (prev.currentIndex !== newState.currentIndex) {
          newState.hasNext =
            newState.currentIndex < newState.topicIds.length - 1;
          newState.hasPrev = newState.currentIndex > 0;
        }
        return newState;
      });
    },
    [taskFrame]
  );

  const changeFrame = useCallback(
    (frameNo: string) => {
      if (taskRom.status !== 'loaded') return;
      _updateTaskFrame((pre) => ({
        ...pre,
        status: 'loading',
        currentFrame: frameNo,
      }));
    },
    [taskRom, _updateTaskFrame]
  );

  const saveFrameTaskAnnotations = useCallback(() => {
    _updatePageStatus('saving');
    projectRepository.saveFrameTaskAnnotations(taskAnnotations).then(() => {
      _updatePageStatus('ready');
      setIsTaskAnnotationUpdated(false);
    });
  }, [projectRepository, taskAnnotations, _updatePageStatus]);

  const updateTaskAnnotations = useCallback(
    (param: UpdateTaskAnnotationsCommand) => {
      // ${updateTaskAnnotations}$ commands:[{command:'move'|'updateAttr', params for command}]
      //   move points
      //   setAttr[code only]
      setIsTaskAnnotationUpdated(true);
      if (param.type === 'objectTransForm') {
        _updateTaskAnnotationsFunc((prev) => {
          for (let i = 0, len = prev.length; i < len; i++) {
            const taskVo = prev[i];
            const c = param.changes[taskVo.id];
            if (!c) continue;
            const newTaskVo = Object.assign({}, taskVo);
            const newPoints = c.points.map((point) =>
              MathUtil.round(point)
            ) as ThreePoints;
            newTaskVo.points[param.frameNo] = newPoints;
            newTaskVo.pointsMeta[param.frameNo] = { autogenerated: false };

            if (taskToolBar.interpolation) {
              // interpolation UPDATE START
              const changedFrameNo = param.frameNo;
              const pointsMeta = newTaskVo.pointsMeta;
              const { updateBaseFrame, copyTargets, updateTargets } =
                Object.keys(newTaskVo.points)
                  .sort()
                  .reduce<{
                    lower: boolean;
                    end: boolean;
                    updateBaseFrame: string;
                    prevFrameNo: number;
                    copyTargets: string[];
                    updateTargets: string[];
                  }>(
                    (prev, frameNo) => {
                      if (prev.end) {
                        return prev;
                      }
                      prev.lower = frameNo < changedFrameNo;
                      if (changedFrameNo === frameNo) {
                        prev.prevFrameNo = parseInt(frameNo);
                        return prev;
                      }

                      const intFrameNo = parseInt(frameNo);
                      if (
                        (prev.prevFrameNo !== -1 &&
                          prev.prevFrameNo + 1 !== intFrameNo) ||
                        !pointsMeta[frameNo].autogenerated
                      ) {
                        if (prev.lower) {
                          prev.prevFrameNo = -1;
                          prev.updateTargets.length = 0;
                          prev.updateBaseFrame = frameNo;
                        } else {
                          prev.end = true;
                        }
                        return prev;
                      }
                      if (prev.lower) {
                        prev.updateTargets.push(frameNo);
                      } else {
                        prev.copyTargets.push(frameNo);
                      }
                      prev.prevFrameNo = intFrameNo;
                      return prev;
                    },
                    {
                      lower: true,
                      end: false,
                      prevFrameNo: -1,
                      updateBaseFrame: '',
                      copyTargets: [],
                      updateTargets: [],
                    }
                  );
              copyTargets.forEach((frameNo) => {
                newTaskVo.points[frameNo] = newPoints;
              });

              const updatedFrameCount = updateTargets.length;
              if (updatedFrameCount > 0) {
                const basePoints = newTaskVo.points[updateBaseFrame];
                // calc diffs
                const diffPoints = basePoints.map(
                  (value, index) => value - newPoints[index]
                );
                // to each frame amount
                const frameAmountPoints = diffPoints.map((value) =>
                  MathUtil.round(value !== 0 ? value / updatedFrameCount : 0)
                );
                updateTargets.reduce((prev, frameNo) => {
                  // add amount
                  const added = prev.map(
                    (value, index) => value - frameAmountPoints[index]
                  ) as ThreePoints;
                  newTaskVo.points[frameNo] = added;
                  return added;
                }, basePoints);
              }
              // interpolation UPDATE END
            }
            prev[i] = newTaskVo;
            _updateEditingTaskAnnotation(newTaskVo);
          }
          return prev;
        });
      } else if (param.type === 'addFrame') {
        _updateTaskAnnotationsFunc((prev) =>
          prev.map((vo) => {
            if (vo.id !== param.id || vo.points[param.frameNo]) {
              return vo;
            }
            const { prev, next } = TaskAnnotationUtil.findNearestFramePoints(
              vo,
              param.frameNo
            );
            const nearestFrameNo = prev !== param.frameNo ? prev : next;
            vo.points[param.frameNo] = [...vo.points[nearestFrameNo]];
            vo.pointsMeta[param.frameNo] = { autogenerated: false };
            return vo;
          })
        );
      } else if (param.type === 'removeFrame') {
        _updateTaskAnnotationsFunc(
          (prev) =>
            prev
              .map((vo) => {
                if (vo.id !== param.id) {
                  return vo;
                }
                delete vo.points[param.frameNo];
                delete vo.pointsMeta[param.frameNo];
                if (Object.keys(vo.points).length === 0) {
                  resetSelectMode();
                  return undefined;
                }
                return vo;
              })
              .filter((vo) => !!vo) as TaskAnnotationVO[]
        );
      } else if (param.type === 'removeAll') {
        resetSelectMode();
        _updateTaskAnnotationsFunc((prev) =>
          prev.filter((i) => i.id !== param.id)
        );
      }
    },
    [
      _updateTaskAnnotationsFunc,
      taskToolBar.interpolation,
      _updateEditingTaskAnnotation,
      resetSelectMode,
    ]
  );

  const addTaskAnnotations = useCallback(
    (vos: TaskAnnotationVO[]) => {
      _updateTaskAnnotationsFunc((prev) => prev.concat(vos));
    },
    [_updateTaskAnnotationsFunc]
  );

  const copyFrameTaskAnnotations = useCallback(
    (targetId?: string) => {
      if (!frameNoSet) return;
      _updateTaskAnnotationsFunc((prev) => {
        return TaskAnnotationUtil.copyFramePoints(prev, frameNoSet, targetId);
      });
    },
    [_updateTaskAnnotationsFunc, frameNoSet]
  );

  // ${copyTaskAnnotations}$ void
  // ${pasteTaskAnnotations}$ target:{x:y:z}

  // ${applyFrameHistory} 'prev'|'next'

  // ${changeVisibleLabel}
  // ${changePointerMode}

  const changePageMode = useCallback(
    (pageMode: 'threeEdit' | 'classesList') => {
      _updateTaskEditor((prev) => {
        return {
          ...prev,
          pageMode,
        };
      });
    },
    [_updateTaskEditor]
  );

  const selectAnnotationClass = useCallback(
    (vo: AnnotationClassVO) => {
      _updateTaskEditor((prev) => {
        return {
          ...prev,
          editorState: {
            mode: 'selecting_annotationClass',
            selectingAnnotationClass: vo,
            selectingTaskAnnotations: [],
          },
        };
      });
    },
    [_updateTaskEditor]
  );

  const selectTaskAnnotations = useCallback(
    (vo: TaskAnnotationVO[], mode?: 'add' | 'remove' | 'single' | 'clear') => {
      _updateTaskEditor((prev) => {
        let annotations = prev.editorState
          .selectingTaskAnnotations as TaskAnnotationVO[];
        if (mode === 'add') {
          annotations = annotations.concat(vo);
        } else if (mode === 'remove') {
          const removeTarget = new Set(vo.map((a) => a.id));
          annotations = annotations.filter((a) => !removeTarget.has(a.id));
          if (annotations.length === 1) {
            _updateEditingTaskAnnotation(vo[0]);
          }
        } else if (mode === 'single') {
          annotations = vo;
          _updateEditingTaskAnnotation(vo[0]);
        } else if (mode === 'clear') {
          annotations = [];
          _updateEditingTaskAnnotation(undefined);
        }
        return {
          ...prev,
          editorState: {
            mode: 'selecting_taskAnnotation',
            selectingAnnotationClass: undefined,
            selectingTaskAnnotations: annotations,
          },
        };
      });
    },
    [_updateEditingTaskAnnotation]
  );

  const onChangeCurrentFrameAppearance = useCallback(
    (taskAnnotation: TaskAnnotationVO) => {
      if (taskFrame.status !== 'loaded') {
        return;
      }
      const currentFrameNo = parseInt(taskFrame.currentFrame);
      const newTaskAnnotation = Object.assign({}, taskAnnotation);

      const pointsMeta = taskAnnotation.pointsMeta as {
        [key: string]: ThreePointsMeta;
      };

      const points = taskAnnotation.points as {
        [key: string]: ThreePoints;
      };

      if (pointsMeta[taskFrame.currentFrame]) {
        delete pointsMeta[taskFrame.currentFrame];
        const nextFrame = TaskAnnotationUtil.formatFrameNo(currentFrameNo + 1);
        if (pointsMeta[nextFrame]) {
          pointsMeta[nextFrame].autogenerated = false;
        }
        const preFrame = TaskAnnotationUtil.formatFrameNo(currentFrameNo - 1);
        if (pointsMeta[preFrame]) {
          pointsMeta[preFrame].autogenerated = false;
        }
        newTaskAnnotation.pointsMeta = pointsMeta;
      } else {
        const { prev, next } = TaskAnnotationUtil.findNearestFramePoints(
          taskAnnotation,
          taskFrame.currentFrame
        );

        if (prev && next) {
          const previousFrame = parseInt(prev);
          const nextFrame = parseInt(next);
          if (nextFrame - currentFrameNo > currentFrameNo - previousFrame) {
            points[taskFrame.currentFrame] = points[prev];
            pointsMeta[taskFrame.currentFrame] = pointsMeta[prev];
          } else {
            points[taskFrame.currentFrame] = points[next];
            pointsMeta[taskFrame.currentFrame] = pointsMeta[next];
          }
        } else if (prev) {
          points[taskFrame.currentFrame] = points[prev];
          pointsMeta[taskFrame.currentFrame] = pointsMeta[prev];
        } else if (next) {
          points[taskFrame.currentFrame] = points[next];
          pointsMeta[taskFrame.currentFrame] = pointsMeta[next];
        }
        newTaskAnnotation.points = points;
      }
      _updateTaskAnnotationsFunc((prevVos) =>
        prevVos.map((vo) => {
          if (vo.id !== taskAnnotation.id) {
            return vo;
          }
          return newTaskAnnotation;
        })
      );
    },
    [taskFrame, _updateTaskAnnotationsFunc]
  );

  const onChangeFrameAppearance = useCallback(
    (taskAnnotation: TaskAnnotationVO) => {
      const newTaskAnnotation = Object.assign({}, taskAnnotation);
      const newPoints = {} as { [key: string]: ThreePoints };
      const newPointsMeta = {} as { [key: string]: ThreePointsMeta };

      if (taskFrame.status !== 'loaded' || taskRom.status !== 'loaded') {
        return;
      }
      const totalFrames = taskRom.frames.length;
      const currentFrameNo = parseInt(taskFrame.currentFrame);
      const pointsMeta = taskAnnotation.pointsMeta as {
        [key: string]: ThreePointsMeta;
      };

      const points = taskAnnotation.points as {
        [key: string]: ThreePoints;
      };

      // Variable for handling to remove or keep existed annotation on later frames from current frame
      let shouldKeepLaterFrames = false;

      if (points[taskFrame.currentFrame]) {
        for (
          let targetFrame = 1;
          targetFrame <= totalFrames + 1;
          targetFrame++
        ) {
          const targetFrameNo = TaskAnnotationUtil.formatFrameNo(targetFrame);
          const pointsByFrame = points[targetFrameNo];
          const pointsMetaByFrame = pointsMeta[targetFrameNo];
          if (targetFrame < currentFrameNo) {
            if (pointsByFrame && pointsMetaByFrame) {
              newPoints[targetFrameNo] = pointsByFrame;
              newPointsMeta[targetFrameNo] = {
                autogenerated:
                  targetFrame === currentFrameNo - 1
                    ? false
                    : pointsMetaByFrame.autogenerated,
              };
              continue;
            }
          }
          if (targetFrame >= currentFrameNo) {
            if (shouldKeepLaterFrames) {
              if (pointsByFrame && pointsMetaByFrame) {
                newPoints[targetFrameNo] = pointsByFrame;
                newPointsMeta[targetFrameNo] = pointsMetaByFrame;
              }
              continue;
            }
            if (pointsByFrame && pointsMetaByFrame) {
              continue;
            } else {
              shouldKeepLaterFrames = true;
              continue;
            }
          }
        }
        newTaskAnnotation.points = newPoints;
        newTaskAnnotation.pointsMeta = newPointsMeta;
      } else {
        const { prev, next } = TaskAnnotationUtil.findNearestFramePoints(
          taskAnnotation,
          taskFrame.currentFrame
        );
        let isReachedFirstFrame = false;

        for (let targetFrame = 1; targetFrame <= totalFrames; targetFrame++) {
          const targetFrameNo = TaskAnnotationUtil.formatFrameNo(targetFrame);
          const pointsByFrame = points[targetFrameNo];
          const pointsMetaByFrame = pointsMeta[targetFrameNo];
          if (!isReachedFirstFrame && pointsByFrame) {
            isReachedFirstFrame = true;
          }

          if (targetFrame < currentFrameNo) {
            if (pointsByFrame && pointsMetaByFrame) {
              newPoints[targetFrameNo] = pointsByFrame;
              newPointsMeta[targetFrameNo] = pointsMetaByFrame;
            }
            continue;
          }
          if (targetFrame >= currentFrameNo) {
            if (!isReachedFirstFrame && !pointsByFrame && !prev && next) {
              newPoints[targetFrameNo] = points[next];
              newPointsMeta[targetFrameNo] = {
                autogenerated: targetFrame !== currentFrameNo,
              };
              continue;
            }
          }
          if (shouldKeepLaterFrames) {
            if (pointsByFrame && pointsMetaByFrame) {
              newPoints[targetFrameNo] = pointsByFrame;
              newPointsMeta[targetFrameNo] = pointsMetaByFrame;
            }
            continue;
          }
          if (!shouldKeepLaterFrames) {
            if (pointsByFrame && !pointsMetaByFrame.autogenerated) {
              shouldKeepLaterFrames = true;
              newPoints[targetFrameNo] = pointsByFrame;
              newPointsMeta[targetFrameNo] = pointsMetaByFrame;
              continue;
            }
          }
          if (prev) {
            newPoints[targetFrameNo] = points[prev];
            newPointsMeta[targetFrameNo] = {
              autogenerated: targetFrame !== currentFrameNo,
            };
            continue;
          }
        }
        newTaskAnnotation.points = newPoints;
        newTaskAnnotation.pointsMeta = newPointsMeta;
      }
      _updateTaskAnnotationsFunc((prevVos) =>
        prevVos.map((vo) => {
          if (vo.id !== taskAnnotation.id) {
            return vo;
          }
          return newTaskAnnotation;
        })
      );
    },
    [taskFrame, taskRom, _updateTaskAnnotationsFunc]
  );

  return {
    isTaskAnnotationUpdated,
    setIsTaskAnnotationUpdated,
    taskToolBar,
    pageStatus,
    // states
    taskRom,
    taskAnnotations,
    taskFrame,
    topicImageDialog,
    taskEditor,

    editingTaskAnnotation,
    // control
    updateTaskToolBar,
    // # ImageDialog
    openImageDialog,
    moveTopicImage,
    // # Project/Task
    open,
    reopen,
    fetchAnnotationClasses,

    // # Frame
    changeFrame,
    saveFrameTaskAnnotations,

    // # TaskAnnotations
    addTaskAnnotations,
    updateTaskAnnotations,
    copyFrameTaskAnnotations,

    changePageMode,
    selectAnnotationClass,
    selectTaskAnnotations,
    resetSelectMode,

    onChangeCurrentFrameAppearance,
    onChangeFrameAppearance,
  };
};

export default createContainer(useTask);
