/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { ProjectType } from '../types/const';
import {
  AnnotationClassVO,
  TaskAnnotationVO,
  TaskFrameVO,
  TaskROMVO,
} from '../types/vo';

export type ProjectRepository = {
  create(vo: {
    projectId: string;
    type: ProjectType;
    targets: File[];
  }): Promise<{ projectId: string; errorCode?: string }>;
  load(
    projectId: string,
    taskId?: string,
    frameNo?: string
  ): Promise<{ taskROM: TaskROMVO; taskAnnotations: TaskAnnotationVO[] }>;
  loadAnnotationClasses(
    projectId: string
  ): Promise<{ annotationClasses: AnnotationClassVO[] }>;
  saveAnnotationClasses(vo: {
    projectId: string;
    annotationClasses: AnnotationClassVO[];
  }): Promise<void>;
  loadFrameResource(
    projectId: string,
    taskId: string,
    frameNo: string,
    pcdTopicId: string,
    imageTopics?: { [topicId: string]: string }
  ): Promise<TaskFrameVO>;
  saveFrameTaskAnnotations(vo: TaskAnnotationVO[]): Promise<void>;
  exportTaskAnnotations(
    vo: TaskAnnotationVO[]
  ): Promise<{ status?: boolean; path?: string; message?: string }>;
};

const STUB: ProjectRepository = {
  create(vo: {
    projectId: string;
    type: ProjectType;
    targets: File[];
  }): Promise<{ projectId: string }> {
    return new Promise((resolve, reject) => {});
  },
  load(
    projectId: string,
    taskId: string,
    frameNo?: string
  ): Promise<{ taskROM: TaskROMVO; taskAnnotations: TaskAnnotationVO[] }> {
    return new Promise((resolve, reject) => {});
  },
  loadAnnotationClasses(
    projectId: string
  ): Promise<{ annotationClasses: AnnotationClassVO[] }> {
    return new Promise((resolve, reject) => {});
  },
  saveAnnotationClasses(vo: {
    annotationClasses: AnnotationClassVO[];
  }): Promise<void> {
    return new Promise((resolve, reject) => {});
  },
  loadFrameResource(
    projectId: string,
    taskId: string,
    frameNo: string,
    pcdTopicId: string,
    imageTopics?: { [topicId: string]: string }
  ): Promise<TaskFrameVO> {
    return new Promise((resolve, reject) => {});
  },
  saveFrameTaskAnnotations(vo: TaskAnnotationVO[]): Promise<void> {
    return new Promise((resolve, reject) => {});
  },
  exportTaskAnnotations(
    vo: TaskAnnotationVO[]
  ): Promise<{ status?: boolean; path?: string; message?: string }> {
    return new Promise((resolve, reject) => {});
  },
};

export const ProjectRepositoryContext =
  React.createContext<ProjectRepository>(STUB);
