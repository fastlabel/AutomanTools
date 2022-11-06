export const ViewUtils = {
  offsetHeight: (offset = 0, isElectron?: boolean): string => {
    let total = offset;
    if (isElectron) {
      total += 39;
    }
    return total > 0 ? `${total}px` : '0px';
  },
};
