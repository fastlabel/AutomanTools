
import { LoaderUtils } from "three";
import { ProjectType } from "../types/const";
import { AnnotationClassVO, TaskAnnotationVO, TaskFrameVO, TaskImageTopicVO, TaskROMVO } from '../types/vo';
import PcdUtil from "../utils/pcd-util";
import { ProjectRepository } from "./project-repository";

const workspaceApi = window.workspace;

const IMAGE_EXTENSION = ['jpg', 'jpeg', 'JPG', 'JPEG', 'jpe', 'jfif', 'pjpeg', 'pjp', 'png', 'PNG'];

const arrayBufferToDataUrl = (extension: string, buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const dataUrl = `data:image/${extension.toLowerCase()};base64,${window.btoa(binary)}`;
    return dataUrl;
}

export const useProjectFsRepository = (workspaceContext: any): ProjectRepository => {
    return ({
        create(vo: { projectId: string; type: ProjectType; targets: File[] }): Promise<void> {

            const targetQuery = vo.targets.reduce<any>((res, f) => {
                const [topicId, extension] = f.name.split('.');
                const targetInfo = res.target_info.resource;

                // TODO workaround
                if (!res['0001']) {
                    res['0001'] = {};
                    targetInfo.frames.push('0001');
                }
                if (extension === 'pcd') {
                    res['0001'][topicId] = { method: 'copy', fromPath: f.path, extension };
                    targetInfo.pcdTopicId = topicId;
                    return res;
                } else if (IMAGE_EXTENSION.includes(extension)) {
                    res['0001'][topicId] = { method: 'copy', fromPath: f.path, extension };
                    targetInfo.imageTopics.push({ topicId, extension } as TaskImageTopicVO);
                    return res;
                }
                throw new Error('Non supported file !');
            }, {
                target_info: {
                    method: 'json',
                    resource: {
                        frames: [],
                        pcdTopicId: '',
                        imageTopics: []
                    }
                }
            });

            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.save({
                    wkDir,
                    query: {
                        meta: {
                            project: { method: 'json', resource: { projectId: vo.projectId } },
                            annotation_classes: { method: 'json', resource: [] },
                        },
                        target: targetQuery,
                        output: {
                            annotation_data: { method: 'json', resource: [] }
                        }
                    }
                }).then(() => resolve())
                    .catch(err => reject(err));
            });
        },
        load(projectId: string, taskId?: string, frameNo?: string): Promise<{ taskROM: TaskROMVO, taskAnnotations: TaskAnnotationVO[] }> {
            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.load({
                    wkDir,
                    query: {
                        meta: {
                            project: true,
                            annotation_classes: true
                        },
                        target: {
                            target_info: true
                        },
                        output: {
                            annotation_data: true
                        }
                    }
                }).then((res) => {
                    const project = res.meta?.project;
                    const annotationClasses = res.meta?.annotation_classes;
                    const targetInfo = res.target?.target_info;
                    const taskROM = { ...project, ...targetInfo, annotationClasses };
                    const taskAnnotations = res.output?.annotation_data;
                    resolve({ taskROM, taskAnnotations });
                }).catch(err => reject(err));
            });
        },
        loadAnnotationClasses(projectId: string): Promise<{ annotationClasses: AnnotationClassVO[] }> {
            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.load({
                    wkDir,
                    query: {
                        meta: {
                            annotation_classes: true
                        }
                    }
                }).then((res) => {
                    resolve({ annotationClasses: res.meta?.annotation_classes });
                }).catch(err => reject(err));
            });
        },
        saveAnnotationClasses(vo: { annotationClasses: AnnotationClassVO[] }): Promise<void> {
            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.save({
                    wkDir,
                    query: {
                        meta: {
                            annotation_classes: { method: 'json', resource: vo.annotationClasses },
                        }
                    }
                }).then(() => resolve())
                    .catch(err => reject(err));
            });
        },
        loadFrameResource(projectId: string, taskId: string, frameNo: string, pcdTopicId: string, imageTopics?: { [topicId: string]: string }): Promise<TaskFrameVO> {
            const _imageTopics = imageTopics || {};
            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.load({
                    wkDir,
                    query: {
                        target: { [frameNo]: Object.assign({ [pcdTopicId]: 'pcd' }, _imageTopics) }
                    }
                }).then((res) => {
                    if (!res.target) return;
                    const frameDir = res.target[frameNo];
                    const data = frameDir[pcdTopicId];
                    const textData = LoaderUtils.decodeText(new Uint8Array(data));
                    const pcdResource = PcdUtil.parse(data, textData, pcdTopicId);
                    const imageResources = Object.keys(_imageTopics).reduce<any>((r, k) => {
                        r[k] = arrayBufferToDataUrl(_imageTopics[k], frameDir[k]);
                        return r;
                    }, {});
                    resolve({ currentFrame: frameNo, pcdResource, imageResources });
                }).catch(err => reject(err));
            });
        },
        saveFrameTaskAnnotations(vo: TaskAnnotationVO[]): Promise<void> {
            return new Promise((resolve, reject) => {
                const wkDir = workspaceContext.workspaceFolder;
                workspaceApi.save({
                    wkDir,
                    query: {
                        output: {
                            annotation_data: { method: 'json', resource: vo },
                        }
                    }
                }).then(() => resolve())
                    .catch(err => reject(err));
            });
        }
    });
};