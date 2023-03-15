export type CustomDtCallback = (dt: number, ...args: any[]) => void;

export type CustomDtSetInterval = (
  fn: CustomDtCallback,
  stepSize: number,
  ...args: any[]
) => () => void;
