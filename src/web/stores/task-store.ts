import { useCallback, useContext, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { ProjectRepositoryContext } from "../repositories/project-repository";
import { AnnotationClassVO, TaskAnnotationVO, TaskAnnotationVOPoints, TaskFrameVO, TaskROMVO } from "../types/vo";


export type TaskROMState = {
    status: 'none';
} | {
    status: 'loading';
    // [ref] scope=project
    projectId: string;
    // [ref] scope=task
    taskId: string;
} | ({
    status: 'loaded';
} & TaskROMVO);

export type TaskFrameState = {
    status: 'none';
} | {
    status: 'loading';
    currentFrame: string;
} | ({
    status: 'loaded';
} & TaskFrameVO);

export type TopicImageDialogState = {
    open: false
} | {
    open: true;
    position: { x: number, y: number };
    topicId: string
};

export type TaskEditorState = {
    pageMode: 'threeEdit' | 'classesList' | 'classesForm';

    editorState: {
        mode: 'neutral';
        selectingAnnotationClass?: null;
        selectingTaskAnnotations: [];
    } | {
        mode: 'selecting_annotationClass';
        selectingAnnotationClass: AnnotationClassVO;
        selectingTaskAnnotations: [];
    } | {
        mode: 'selecting_taskAnnotation';
        selectingAnnotationClass?: null;
        selectingTaskAnnotations: TaskAnnotationVO[];
    }

    clipboard?: {
        type: 'taskAnnotations';
        items: TaskAnnotationVO[];
    }
};

export type UpdateTaskAnnotationsCommand = {
    type: 'objectTransForm';
    frameNo: string;
    changes: {
        [id: string]: {
            points: TaskAnnotationVOPoints;
        }
    };
} | {
    type: 'updateAttr';
};

const useTask = () => {
    const projectRepository = useContext(ProjectRepositoryContext);
    const [pageStatus, _updatePageStatus] = useState<'preparing' | 'loading' | 'ready' | 'saving'>('preparing');

    const [taskRom, _updateTaskRom] = useState<TaskROMState>({ status: 'none' });

    const [taskAnnotations, _updateTaskAnnotations] = useState<TaskAnnotationVO[]>([]);

    const [taskFrame, _updateTaskFrame] = useState<TaskFrameState>({ status: 'none' });

    const [topicImageDialog, _updateTopicImageDialog] = useState<TopicImageDialogState>({ open: false });

    const [taskEditor, _updateTaskEditor] = useState<TaskEditorState>({ pageMode: 'threeEdit', editorState: { mode: 'neutral', selectingTaskAnnotations: [] } });

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
        throw new Error(`illegal pageState taskRom:${taskRom.status}, taskFrame:${taskFrame.status}`);
    }, [taskRom.status, taskFrame.status]);

    // load frameNo
    useEffect(() => {
        if (taskFrame.status === 'loading' && taskRom.status === 'loaded') {
            const { projectId, taskId, pcdTopicId, imageTopics } = taskRom;
            const frameNo = taskFrame.currentFrame;
            projectRepository.loadFrameResource(projectId, taskId, frameNo, pcdTopicId).then(vo => {
                _updateTaskFrame({ ...vo, status: 'loaded' });
            });
            return;
        }
    }, [taskFrame])

    // Task Store Event
    const open = useCallback((projectId: string, taskId: string, frameNo?: string) => {
        _updateTaskRom({ status: 'loading', projectId, taskId });
        projectRepository.load(projectId, taskId).then(vo => {
            _updateTaskRom({ ...vo.taskROM, status: 'loaded' });
            _updateTaskAnnotations(vo.taskAnnotations);
            const _frameNo = frameNo || '0001';
            if (_frameNo) {
                _updateTaskFrame({ status: 'loading', currentFrame: _frameNo });
            }
        });
    }, [projectRepository, _updateTaskRom, _updateTaskAnnotations, _updateTaskFrame]);

    const fetchAnnotationClasses = useCallback((projectId: string) => {
        // this way will be removed when support project.
        _updatePageStatus('loading');
        projectRepository.loadAnnotationClasses(projectId).then(vo => {
            _updateTaskRom((prev) => ({ ...prev, annotationClasses: vo.annotationClasses }));
            // TODO update taskAnnotation
            _updatePageStatus('ready');
        });
    }, [projectRepository, _updateTaskRom, _updatePageStatus]);

    const changeFrame = useCallback((frameNo: string) => {
        if (taskRom.status !== 'loaded') return;
        _updateTaskFrame({ status: 'loading', currentFrame: frameNo });
    }, [taskRom, _updateTaskFrame]);

    const saveFrameTaskAnnotations = useCallback(() => {
        _updatePageStatus('saving');
        projectRepository.saveFrameTaskAnnotations(taskAnnotations).then(() => {
            _updatePageStatus('ready');
        });
    }, [projectRepository, taskAnnotations, _updatePageStatus]);

    const updateTaskAnnotations = useCallback((param: UpdateTaskAnnotationsCommand) => {
        // ${updateTaskAnnotations}$ commands:[{command:'move'|'updateAttr', params for command}]
        //   move points
        //   setAttr[code only]
        if (param.type === 'objectTransForm') {
            _updateTaskAnnotations(prev => {
                prev.forEach(taskVo => {
                    const c = param.changes[taskVo.id];
                    if (!c) return;
                    taskVo.points[param.frameNo] = c.points;
                });
                return prev;
            });
        }
    }, [_updateTaskAnnotations]);

    const addTaskAnnotations = useCallback((vos: TaskAnnotationVO[]) => {
        _updateTaskAnnotations(prev => prev.concat(vos));
    }, [_updateTaskAnnotations]);

    const removeTaskAnnotations = (taskAnnotationIds: string[]) => {

    };

    // ${copyTaskAnnotations}$ void
    // ${pasteTaskAnnotations}$ target:{x:y:z}

    // ${applyFrameHistory} 'prev'|'next'

    // ${changeVisibleLabel}
    // ${changePointerMode}

    const selectAnnotationClass = useCallback((vo: AnnotationClassVO) => {
        _updateTaskEditor((prev) => {
            return ({
                ...prev, editorState: {
                    mode: 'selecting_annotationClass',
                    selectingAnnotationClass: vo,
                    selectingTaskAnnotations: []
                }
            });
        });
    }, [_updateTaskEditor]);

    const selectTaskAnnotations = useCallback((vo: TaskAnnotationVO[], mode?: 'add' | 'remove' | 'single') => {
        _updateTaskEditor((prev) => {
            let annotations = prev.editorState.selectingTaskAnnotations as TaskAnnotationVO[];
            if (mode === 'add') {
                annotations = annotations.concat(vo);
            } else if (mode === 'remove') {
                const removeTarget = new Set(vo.map(a => a.id));
                annotations = annotations.filter(a => !removeTarget.has(a.id));
            } else if (mode === 'single') {
                annotations = vo;
            }
            return ({
                ...prev, editorState: {
                    mode: 'selecting_taskAnnotation',
                    selectingAnnotationClass: undefined,
                    selectingTaskAnnotations: annotations
                }
            });
        });
    }, [_updateTaskEditor]);

    return {
        pageStatus,
        // states
        taskRom,
        taskAnnotations,
        taskFrame,
        topicImageDialog,
        taskEditor,
        // control
        // # Project/Task
        open,
        fetchAnnotationClasses,

        // # Frame
        changeFrame,
        saveFrameTaskAnnotations,

        // # TaskAnnotations
        addTaskAnnotations,
        updateTaskAnnotations,
        removeTaskAnnotations,

        selectAnnotationClass,
        selectTaskAnnotations
    };
}

export default createContainer(useTask);
