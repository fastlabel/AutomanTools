import { ProjectType } from '@fl-three-editor/types/const';
import { TaskImageTopicVO } from '@fl-three-editor/types/vo';

const IMAGE_EXTENSION = [
  'jpg',
  'jpeg',
  'JPG',
  'JPEG',
  'jpe',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'PNG',
];

export const ReferenceTargetUtil = {
  reduceFiles: (
    type: ProjectType,
    files: File[],
    resolveBlobFile?: (file: File, extension: string) => any,
    resolveJsonFile?: (jsonObj: any) => any
  ) => {
    const calibration = new Set();
    const frames = new Set<string>();
    const topicIds = new Set();

    const targetQuery = files.reduce<any>(
      (res, f) => {
        const [topicId, extension] = f.name.split('.');
        const targetInfo = res.target_info;

        const delimiter = f.path.includes('\\') ? '\\' : '/';
        const paths = f.path.split(delimiter);
        let parent = paths[paths.length - 2];
        const cFrameNo = Number(parent);
        if (
          !(
            parent === 'calibration' ||
            (!Number.isNaN(cFrameNo) && Number.isInteger(cFrameNo))
          )
        ) {
          if (type === ProjectType.pcd_image_frames) {
            throw new Error(
              'folder structure is not supported !! path:' + f.path
            );
          }
          parent =
            extension === 'yaml' || extension === 'yml'
              ? 'calibration'
              : '0001';
        }

        if (!res[parent]) {
          res[parent] = {};
          if (parent !== 'calibration') {
            frames.add(parent);
          }
        }
        if (extension === 'pcd') {
          res[parent][topicId] = resolveBlobFile
            ? resolveBlobFile(f, extension)
            : f;
          targetInfo.pcdTopicId = topicId;
          return res;
        } else if (IMAGE_EXTENSION.includes(extension)) {
          res[parent][topicId] = resolveBlobFile
            ? resolveBlobFile(f, extension)
            : f;
          if (!topicIds.has(topicId)) {
            topicIds.add(topicId);
            targetInfo.imageTopics.push({
              topicId,
              extension,
            } as TaskImageTopicVO);
          }
          return res;
        } else if (extension === 'yaml' || extension === 'yml') {
          res[parent][topicId] = resolveBlobFile
            ? resolveBlobFile(f, extension)
            : f;
          calibration.add(topicId);
          return res;
        }
        throw new Error('Non supported file !');
      },
      {
        target_info: {
          frames: [],
          pcdTopicId: '',
          imageTopics: [],
        },
      }
    );
    targetQuery.target_info.frames = Array.from<string>(frames.values()).sort();
    targetQuery.target_info.imageTopics.forEach((t: TaskImageTopicVO) => {
      t.calibration = calibration.has(t.topicId);
    });
    if (resolveJsonFile) {
      targetQuery.target_info = resolveJsonFile(targetQuery.target_info);
    }
    return targetQuery;
  },
  timestamp: () => {
    const date = new Date();
    const yyyy = `${date.getFullYear()}`;
    const MM = `0${date.getMonth() + 1}`.slice(-2);
    const dd = `0${date.getDate()}`.slice(-2);
    const HH = `0${date.getHours()}`.slice(-2);
    const mm = `0${date.getMinutes()}`.slice(-2);
    const ss = `0${date.getSeconds()}`.slice(-2);
    const ms = `00${date.getMilliseconds()}`.slice(-3);
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}${ms}`;
  },
};
