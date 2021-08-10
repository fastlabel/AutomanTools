import { useContext, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { ProjectRepositoryContext } from "../repositories/project-repository";
import { TaskAnnotationVO, TaskFrameVO, TaskROMVO } from "../types/vo";


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
    } | {
        mode: 'selecting';
        selectingTaskAnnotationIds: TaskAnnotationVO[];
    }

    clipboard?: {
        type: 'taskAnnotations';
        items: TaskAnnotationVO[];
    }
};

const useTask = () => {
    const projectRepository = useContext(ProjectRepositoryContext);
    const [pageStatus, _updatePageStatus] = useState<'preparing' | 'loading' | 'ready' | 'saving'>('preparing');

    const [taskRom, _updateTaskRom] = useState<TaskROMState>({ status: 'none' });

    const [taskAnnotations, _updateTaskAnnotations] = useState<TaskAnnotationVO[]>([]);

    const [taskFrame, _updateTaskFrame] = useState<TaskFrameState>({ status: 'none' });

    const [topicImageDialog, _updateTopicImageDialog] = useState<TopicImageDialogState>({ open: false });

    const [taskEditor, _updateTaskEditor] = useState<TaskEditorState>({ pageMode: 'threeEdit', editorState: { mode: 'neutral' } });

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
    const open = (projectId: string, taskId: string, frameNo?: string) => {
        _updateTaskRom({ status: 'loading', projectId, taskId });
        projectRepository.load(projectId, taskId).then(vo => {
            _updateTaskRom({ ...vo.taskROM, status: 'loaded' });
            _updateTaskAnnotations(vo.taskAnnotations);
            const _frameNo = frameNo || '0001';
            if (_frameNo) {
                _updateTaskFrame({ status: 'loading', currentFrame: _frameNo });
            }
        });
    };

    const fetchAnnotationClasses = (projectId: string) => {
        // this way will be removed when support project.
        _updatePageStatus('loading');
        projectRepository.loadAnnotationClasses(projectId).then(vo => {
            _updateTaskRom((prev) => ({ ...prev, annotationClasses: vo.annotationClasses }));
            // TODO update taskAnnotation
            _updatePageStatus('ready');
        });
    };

    const changeFrame = (frameNo: string) => {
        if (taskRom.status !== 'loaded') return;
        _updateTaskFrame({ status: 'loading', currentFrame: frameNo });
    };

    const saveFrameTaskAnnotations = () => {
        _updatePageStatus('saving');
        projectRepository.saveFrameTaskAnnotations(taskAnnotations).then(() => {
            _updatePageStatus('ready');
        });
    };

    const updateTaskAnnotations = () => {
        // ${updateTaskAnnotations}$ commands:[{command:'move'|'updateAttr', params for command}]
        //   move points
        //   setAttr[code only]
    };

    const addTaskAnnotations = (vos: TaskAnnotationVO[]) => {

    };

    const removeTaskAnnotations = (taskAnnotationIds: string[]) => {

    };

    // ${copyTaskAnnotations}$ void
    // ${pasteTaskAnnotations}$ target:{x:y:z}

    // ${applyFrameHistory} 'prev'|'next'

    // ${changeVisibleLabel}
    // ${changePointerMode}

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
        removeTaskAnnotations
    };
}

export default createContainer(useTask);
