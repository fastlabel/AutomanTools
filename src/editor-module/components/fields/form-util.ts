export const FormUtil = {
  resolve: (name: string, data: { [key: string]: any }): any => {
    const splitName = name.split('.');
    return splitName.reduce((c, n) => c[n], data);
  },
  update: <T extends { [key: string]: any }>(
    name: string,
    value: any,
    data: T
  ): T => {
    const newData = { ...data };
    const splitName = name.split('.');
    const lastName = splitName.pop();
    const parent: { [key: string]: any } = splitName.reduce(
      (c, n) => c[n],
      newData
    );
    if (!lastName) {
      throw new Error(`lastName is undefined name:${name}`);
    }
    parent[lastName] = value;
    return newData;
  },
};
