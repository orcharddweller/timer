import { CustomDtSetInterval } from "./types";

export const setBasicInterval: CustomDtSetInterval = (
  fn,
  stepSize,
  ...args
) => {
  const interval = setInterval(fn, stepSize, stepSize, ...args);

  return () => {
    clearInterval(interval);
  };
};
