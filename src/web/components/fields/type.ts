export type FormAction =
  | {
      type: 'change';
      name: string;
      value: any;
    }
  | {
      type: 'init';
      data: any;
    };

export type FormState<T extends { [key: string]: any }> = {
  data: T;
  helper?: any;
};
