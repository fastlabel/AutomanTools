import { MathUtil } from '@fl-three-editor/utils/math-util';
import { throttle } from 'lodash';
import React from 'react';
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
import { FormatUtil } from '@fl-three-editor/utils/format-util';
import { InterpolationUtil } from '@fl-three-editor/utils/interpolation-util';

const LABEL_VIEW_PAGE_FRAME_SIZE = 4;

export enum TaskEditorViewMode {
  base__normal = 'base__normal',
  anno__multi_frame_view = 'anno__multi_frame_view',
}

export type LoadStatus = 'none' | 'loading' | 'loaded';

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

export type LabelViewState = {
  target: TaskAnnotationVO;
  pageFrames: string[];
  selectedFrame: string;
  pageFrameCount: number;
  selectedPage: number;
  pageCount: number;
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
      type: 'updateTaskAnnotation';
      vo: TaskAnnotationVO;
    }
  | {
      type: 'updateAttr';
    }
  | UpdateTaskAnnotationCommand;

const useTask = () => {
  const [isTaskAnnotationUpdated, setIsTaskAnnotationUpdated] =
    React.useState<boolean>(false);
  const projectRepository = React.useContext(ProjectRepositoryContext);
  const [pageStatus, _updatePageStatus] = React.useState<
    'preparing' | 'loading' | 'ready' | 'saving'
  >('preparing');

  const [taskRom, _updateTaskRom] = React.useState<TaskROMState>({
    status: 'none',
  });

  const [taskAnnotations, _innerUpdateTaskAnnotations] = React.useState<
    TaskAnnotationVO[]
  >([]);

  const [taskFrame, _updateTaskFrame] = React.useState<TaskFrameState>({
    status: 'none',
  });

  const [topicImageDialog, _updateTopicImageDialog] =
    React.useState<TopicImageDialogState>({
      open: false,
      topicIds: [],
      currentIndex: -1,
    });

  const [taskEditor, _updateTaskEditor] = React.useState<TaskEditorState>({
    pageMode: 'threeEdit',
    editorState: { mode: 'neutral', selectingTaskAnnotations: [] },
  });

  const [editingTaskAnnotation, _setEditingTaskAnnotation] =
    React.useState<TaskAnnotationVO>();

  // for label view
  const [taskEditorViewMode, _setTaskEditorViewMode] = React.useState(
    TaskEditorViewMode.base__normal
  );
  const [labelViewState, _setLabelViewState] = React.useState<LabelViewState>();
  const [taskFrames, _updateTaskFrames] = React.useState<{
    [key: string]: TaskFrameState;
  }>({});
  const [loadStatus, _setLoadStatus] = React.useState<LoadStatus>('none');

  const _updateEditingTaskAnnotation = throttle(
    (newVo: TaskAnnotationVO | undefined) => {
      _setEditingTaskAnnotation(newVo);
    },
    500
  );

  const _updateTaskAnnotations = React.useCallback(
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

  const _updateTaskAnnotationsFunc = React.useCallback(
    (func: (prev: TaskAnnotationVO[]) => TaskAnnotationVO[]) => {
      _updateTaskAnnotations(func(taskAnnotations));
    },
    [_updateTaskAnnotations, taskAnnotations]
  );

  const [taskToolBar, updateTaskToolBar] = React.useState<TaskToolbar>({
    useOrthographicCamera: false,
    selectMode: 'select',
    showLabel: false,
    interpolation: true,
  });

  React.useEffect(() => {
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
  React.useEffect(() => {
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

  const frameNoSet = React.useMemo(() => {
    if (taskRom.status !== 'loaded' || taskFrame.status !== 'loaded') {
      return undefined;
    }
    const currentFrameNo = Number(taskFrame.currentFrame);
    return {
      source: taskRom.frames[currentFrameNo - 2],
      dist: taskRom.frames[currentFrameNo - 1],
    };
  }, [taskRom, taskFrame]);

  const resetSelectMode = React.useCallback(() => {
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
  const open = React.useCallback(
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

  const reopen = React.useCallback(() => {
    _updateTaskFrame((pre) => ({ ...pre, status: 'none' }));
    setTimeout(() => {
      // workaround reset camera
      _updateTaskFrame((pre: any) => ({ ...pre, status: 'loaded' }));
    }, 50);
  }, [_updateTaskFrame]);

  const fetchAnnotationClasses = React.useCallback(
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

  const openImageDialog = React.useCallback(
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

  const moveTopicImage = React.useCallback(
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

  const changeFrame = React.useCallback(
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

  const saveFrameTaskAnnotations = React.useCallback(() => {
    _updatePageStatus('saving');
    projectRepository.saveFrameTaskAnnotations(taskAnnotations).then(() => {
      _updatePageStatus('ready');
      setIsTaskAnnotationUpdated(false);
    });
  }, [projectRepository, taskAnnotations, _updatePageStatus]);

  const updateTaskAnnotations = React.useCallback(
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
              InterpolationUtil.interpolation(
                param.frameNo,
                newTaskVo.pointsMeta,
                newTaskVo.points,
                newPoints
              );
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
      } else if (param.type === 'updateTaskAnnotation') {
        _updateTaskAnnotationsFunc((prev) =>
          prev.map((_vo) => {
            if (_vo.id === param.vo.id) {
              return param.vo;
            }
            return _vo;
          })
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

  const addTaskAnnotations = React.useCallback(
    (vos: TaskAnnotationVO[]) => {
      _updateTaskAnnotationsFunc((prev) => prev.concat(vos));
    },
    [_updateTaskAnnotationsFunc]
  );

  const copyFrameTaskAnnotations = React.useCallback(
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

  const changePageMode = React.useCallback(
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

  const selectAnnotationClass = React.useCallback(
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

  const selectTaskAnnotations = React.useCallback(
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

  const onChangeCurrentFrameAppearance = React.useCallback(
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

  const onChangeFrameAppearance = React.useCallback(
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

  const changePageLabelView = React.useCallback(
    (target?: TaskAnnotationVO, frameNo?: string, page?: number) => {
      if (taskRom.status === 'loaded') {
        const _pageCount = Math.floor(
          taskRom.frames.length / LABEL_VIEW_PAGE_FRAME_SIZE
        );
        const _lastPageFrameCount =
          taskRom.frames.length % LABEL_VIEW_PAGE_FRAME_SIZE;
        const pageCount = _lastPageFrameCount ? _pageCount + 1 : _pageCount;

        let selectedPage = 0;
        let selectedFrame = '';
        if (page) {
          selectedPage = page;
        } else if (frameNo) {
          const frame = FormatUtil.frameNo2Number(frameNo);
          selectedPage =
            Math.floor((frame - 1) / LABEL_VIEW_PAGE_FRAME_SIZE) + 1;
          selectedFrame = frameNo;
        }

        const pageFrameCount =
          pageCount !== selectedPage
            ? LABEL_VIEW_PAGE_FRAME_SIZE
            : _lastPageFrameCount || LABEL_VIEW_PAGE_FRAME_SIZE;

        const pageFrames: string[] = [];
        const offset = (selectedPage - 1) * LABEL_VIEW_PAGE_FRAME_SIZE;
        for (let i = 1; i <= pageFrameCount; i++) {
          pageFrames.push(FormatUtil.number2FrameNo(offset + i));
        }

        if (!selectedFrame) {
          selectedFrame = pageFrames[0];
        }

        _setTaskEditorViewMode(TaskEditorViewMode.anno__multi_frame_view);
        _setLoadStatus('loading');
        _setLabelViewState((pre) => {
          if (pre) {
            return {
              target: pre.target,
              selectedFrame,
              pageFrames,
              pageFrameCount,
              pageCount,
              selectedPage,
            };
          } else if (target) {
            return {
              target,
              selectedFrame,
              pageFrames,
              pageFrameCount,
              pageCount,
              selectedPage,
            };
          }
          return pre;
        });
        _updateTaskFrame((pre) => ({ ...pre, currentFrame: selectedFrame }));
        _updateTaskFrames(
          pageFrames.reduce<{ [key: string]: TaskFrameState }>((r, frameNo) => {
            r[frameNo] = { status: 'none' };
            return r;
          }, {})
        );
      }
    },
    [taskRom]
  );

  const startLabelView = React.useCallback(
    (target: TaskAnnotationVO, frameNo: string) => {
      changePageLabelView(target, frameNo);
    },
    [changePageLabelView]
  );

  const movePageLabelView = React.useCallback(
    (page: number) => {
      changePageLabelView(undefined, undefined, page);
    },
    [changePageLabelView]
  );

  const moveFrameNoLabelView = React.useCallback((frameNo: string) => {
    _updateTaskFrame((pre) => ({ ...pre, currentFrame: frameNo }));
    _setLabelViewState((pre) => {
      const preObj = pre as LabelViewState;
      return { ...preObj, selectedFrame: frameNo };
    });
  }, []);

  const endLabelView = React.useCallback(() => {
    _setTaskEditorViewMode(TaskEditorViewMode.base__normal);
    _setLabelViewState(undefined);
    _updateTaskFrames({});
  }, []);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (loadStatus === 'loading' && taskRom.status === 'loaded') {
      // TODO consider about imageTopics spec in label view
      const { projectId, taskId, pcdTopicId } = taskRom;
      const loadedFrames: string[] = [];
      labelViewState?.pageFrames.forEach((_pageFrame) => {
        if (taskFrames[_pageFrame].status === 'none') {
          _updateTaskFrames((pre) => {
            const newTaskFrames = { ...pre };
            newTaskFrames[_pageFrame] = {
              currentFrame: _pageFrame,
              status: 'loading',
            };
            return newTaskFrames;
          });
          projectRepository
            .loadFrameResource(projectId, taskId, _pageFrame, pcdTopicId)
            .then((vo) => {
              _updateTaskFrames((pre) => {
                const newTaskFrames = { ...pre };
                newTaskFrames[_pageFrame] = { ...vo, status: 'loaded' };
                return newTaskFrames;
              });
            });
        } else if (taskFrames[_pageFrame].status === 'loading') {
          //
        } else if (taskFrames[_pageFrame].status === 'loaded') {
          loadedFrames.push(_pageFrame);
        }
      });
      if (loadedFrames.length === labelViewState?.pageFrames.length) {
        _setLoadStatus('loaded');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskFrames, loadStatus]);

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

    // #
    taskEditorViewMode,
    labelViewState,
    startLabelView,
    movePageLabelView,
    moveFrameNoLabelView,
    endLabelView,
    taskFrames,
    loadStatus,
  };
};

export default createContainer(useTask);
