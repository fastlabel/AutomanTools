import { Reducer, useContext, useEffect, useReducer } from 'react';
import { createContainer } from 'unstated-next';
import { ProjectRepositoryContext } from '../repositories/project-repository';
import { AnnotationClassVO } from '../types/vo';

export type ClassesAction =
  | {
      type: 'init';
      projectId: string;
      data: AnnotationClassVO[];
    }
  | {
      type: 'add' | 'update';
      vo: AnnotationClassVO;
    }
  | {
      type: 'remove';
      annotationClassId: string;
    }
  | {
      type: 'fetch';
      projectId: string;
    }
  | {
      type: 'fetched';
      data: AnnotationClassVO[];
    }
  | {
      type: 'save';
      callbackSaved?: () => void;
    }
  | {
      type: 'saved';
    }
  | {
      type: 'end';
    };

export type AnnotationClassState =
  | {
      status: 'none';
    }
  | {
      status: 'loading';
      projectId: string;
    }
  | {
      status: 'ready';
      projectId: string;
      data: AnnotationClassVO[];
    }
  | {
      status: 'saving';
      projectId: string;
      data: AnnotationClassVO[];
    }
  | {
      status: 'saved';
      projectId: string;
      data: AnnotationClassVO[];
    };

const reducer: () => Reducer<AnnotationClassState, ClassesAction> = () => {
  return (state, action) => {
    switch (action.type) {
      case 'init':
        if (state.status !== 'none' && state.status !== 'saved')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return {
          status: 'ready',
          projectId: action.projectId,
          data: action.data,
        };
      case 'add':
        if (state.status !== 'ready')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        const added = state.data.concat([action.vo]);
        return { ...state, data: added };
      case 'update':
        if (state.status !== 'ready')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        const updated = state.data.map((c) => {
          if (c.id === action.vo.id) {
            return action.vo;
          }
          return c;
        });
        return { ...state, status: 'ready', data: updated };
      case 'remove':
        if (state.status !== 'ready')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        const removed = state.data.filter(
          (c) => c.id !== action.annotationClassId
        );
        return { ...state, data: removed };
      case 'fetch':
        if (state.status === 'saving')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return { ...state, status: 'loading', projectId: action.projectId };
      case 'fetched':
        if (state.status !== 'loading')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return { ...state, status: 'ready', data: action.data };
      case 'save':
        if (state.status !== 'ready')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return {
          ...state,
          status: 'saving',
          callbackSaved: action.callbackSaved,
        };
      case 'saved':
        if (state.status !== 'saving')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return { ...state, status: 'saved' };
      case 'end':
        if (state.status !== 'saved')
          throw new Error(`illegal state ${JSON.stringify(state)}`);
        return { status: 'none' };
    }
  };
};

const useAnnotationClass = () => {
  const projectRepository = useContext(ProjectRepositoryContext);
  const [annotationClass, dispatchAnnotationClass] = useReducer(reducer(), {
    status: 'none',
  });

  useEffect(() => {
    if (annotationClass.status === 'loading') {
      projectRepository
        .loadAnnotationClasses(annotationClass.projectId)
        .then((res) => {
          dispatchAnnotationClass({
            type: 'fetched',
            data: res.annotationClasses,
          });
        });
    } else if (annotationClass.status === 'saving') {
      projectRepository
        .saveAnnotationClasses({
          projectId: annotationClass.projectId,
          annotationClasses: annotationClass.data,
        })
        .then(() => {
          dispatchAnnotationClass({ type: 'saved' });
        });
    }
  }, [annotationClass]);
  return {
    annotationClass,
    dispatchAnnotationClass,
  };
};
export default createContainer(useAnnotationClass);
