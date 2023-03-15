import { CustomDtSetInterval } from "./types";

export const setSkippingInterval: CustomDtSetInterval = (
  fn,
  stepSize,
  ...args
) => {
  let nextTime = Date.now() + stepSize;

  let timeout: NodeJS.Timeout;

  const _helper = () => {
    const now = Date.now();

    const nSteps = Math.floor((now - nextTime) / stepSize) + 1;

    nextTime = nextTime + nSteps * stepSize;

    let ms = nextTime - now;

    timeout = setTimeout(_helper, ms);

    fn(nSteps * stepSize, ...args);
  };

  timeout = setTimeout(_helper, stepSize);

  return () => {
    clearTimeout(timeout);
  };
};
