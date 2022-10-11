export const FormatUtil = {
  omitVal: (val: string, len: number):string => {
    return '…' + val.slice(val.length - len);
  },
  number2FrameNo: (frame: number):string => {
    return ('0000' + frame).slice(-4);
  },
  frameNo2Number: (frameNo: string):number => {
    return parseInt(frameNo);
  },
};
