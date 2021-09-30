import { throttle } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ProjectRepositoryContext } from '../repositories/project-repository';
import {
  AnnotationClassVO,
  TaskAnnotationVO,
  TaskAnnotationVOPoints,
  TaskFrameVO,
  TaskROMVO,
} from '../types/vo';
import { TaskAnnotationUtil } from './../utils/task-annotation-util';

export type TaskToolbar = {
  useOrthographicCamera: boolean;
  selectMode: 'control' | 'select';
  showLabel: boolean;
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
          points: TaskAnnotationVOPoints;
        };
      };
    }
  | {
      type: 'updateAttr';
    }
  | UpdateTaskAnnotationCommand;

const useTask = () => {
  const projectRepository = useContext(ProjectRepositoryContext);
  const [pageStatus, _updatePageStatus] = useState<
    'preparing' | 'loading' | 'ready' | 'saving'
  >('preparing');

  const [taskRom, _updateTaskRom] = useState<TaskROMState>({ status: 'none' });

  const [taskAnnotations, _updateTaskAnnotations] = useState<
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

  const [taskToolBar, updateTaskToolBar] = useState<TaskToolbar>({
    useOrthographicCamera: false,
    selectMode: 'control',
    showLabel: false,
  });

  const _updateEditingTaskAnnotation = throttle(
    (newVo: TaskAnnotationVO | undefined) => {
      _setEditingTaskAnnotation(newVo);
    },
    500
  );

  //TODO think type
  const [changedHistories, _updateChangedHistories] = useState<any[]>([]);

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
        _updateTaskAnnotations((pre) =>
          TaskAnnotationUtil.merge(pre, vo.annotationClasses)
        );
        _updatePageStatus('ready');
      });
    },
    [projectRepository, _updateTaskRom, _updatePageStatus]
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
    });
  }, [projectRepository, taskAnnotations, _updatePageStatus]);

  const updateTaskAnnotations = useCallback(
    (param: UpdateTaskAnnotationsCommand) => {
      // ${updateTaskAnnotations}$ commands:[{command:'move'|'updateAttr', params for command}]
      //   move points
      //   setAttr[code only]
      if (param.type === 'objectTransForm') {
        _updateTaskAnnotations((prev) => {
          for (let i = 0, len = prev.length; i < len; i++) {
            const taskVo = prev[i];
            const c = param.changes[taskVo.id];
            if (!c) continue;
            const newTaskVo = Object.assign({}, taskVo);
            newTaskVo.points[param.frameNo] = c.points;
            prev[i] = newTaskVo;
            _updateEditingTaskAnnotation(newTaskVo);
          }
          return prev;
        });
      } else if (param.type === 'addFrame') {
        _updateTaskAnnotations((prev) =>
          prev.map((vo) => {
            if (vo.id !== param.id || vo.points[param.frameNo]) {
              return vo;
            }
            const nearestFrameNo = TaskAnnotationUtil.findNearestFramePoints(
              vo,
              param.frameNo
            );
            vo.points[param.frameNo] = [...vo.points[nearestFrameNo]];
            return vo;
          })
        );
      } else if (param.type === 'removeFrame') {
        _updateTaskAnnotations(
          (prev) =>
            prev
              .map((vo) => {
                if (vo.id !== param.id) {
                  return vo;
                }
                delete vo.points[param.frameNo];
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
        _updateTaskAnnotations((prev) => prev.filter((i) => i.id !== param.id));
      }
    },
    [_updateTaskAnnotations, resetSelectMode]
  );

  const addTaskAnnotations = useCallback(
    (vos: TaskAnnotationVO[]) => {
      _updateTaskAnnotations((prev) => prev.concat(vos));
    },
    [_updateTaskAnnotations]
  );

  const copyFrameTaskAnnotations = useCallback(
    (targetId?: string) => {
      if (!frameNoSet) return;
      _updateTaskAnnotations((prev) => {
        return TaskAnnotationUtil.copyFramePoints(prev, frameNoSet, targetId);
      });
    },
    [_updateTaskAnnotations, frameNoSet]
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
    [_updateTaskEditor]
  );

  return {
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
  };
};

export default createContainer(useTask);
