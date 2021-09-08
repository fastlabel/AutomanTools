import { Color } from 'three';
import PcdUtil from './pcd-util';

const calculateMean = (arr: number[]) => {
  let total = 0;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    total += arr[i];
  }
  return total / len;
};

const standardDeviation = (arr: number[], optMean?: number) => {
  const mean = optMean || calculateMean(arr);
  let variance = 0;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    variance += Math.pow(arr[i] - mean, 2);
  }
  variance = variance / len;
  return Math.pow(variance, 0.5);
};

const ColorUtil = {
  normalizeColors(vertices: Float32Array, color?: Color) {
    const normalizedIntensities = [];
    const colors: number[] = [];

    const { max, min, points } = PcdUtil.getMaxMin(vertices, 'z');
    const maxColor = max;
    const minColor = min;
    const intensities = points;

    const mean = calculateMean(intensities);
    const sd = standardDeviation(intensities, mean);
    const filteredIntensities = intensities.filter(
      (i) => Math.abs(i - mean) < sd
    );
    const range = filteredIntensities.reduce(
      (r, i) => {
        if (i < r.min) {
          r.min = i;
        }
        if (i > r.max) {
          r.max = i;
        }
        return r;
      },
      { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
    );

    // normalize colors
    // if greater than 2 sd from mean, set to max color
    // if less than 2 sd from mean, set to min color
    // ortherwise normalize color based on min and max z-coordinates
    intensities.forEach((intensity, i) => {
      let r = intensity;
      if (intensity - mean >= 2 * sd) {
        r = 1;
      } else if (mean - intensity >= 2 * sd) {
        r = 0;
      } else {
        r = (intensity - range.min) / (range.max - range.min);
      }
      normalizedIntensities.push(r);
      const color = new Color(r, 0, 1 - r).multiplyScalar(r * 5);
      const baseIndex = i * 3;
      colors[baseIndex] = color.r;
      colors[baseIndex + 1] = color.g;
      colors[baseIndex + 2] = color.b;
    });
    return colors;
  },
};

export default ColorUtil;
