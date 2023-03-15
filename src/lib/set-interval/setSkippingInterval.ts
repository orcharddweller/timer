import { CustomDtSetInterval } from "./types";

export const setSkippingInterval: CustomDtSetInterval = (
  fn,
  stepSize,
  ...args
) => {
  let lastTime = Date.now() + stepSize;

  let timeout: NodeJS.Timeout;

  const _helper = () => {
    const now = Date.now();

    const nSteps = Math.floor((now - lastTime) / stepSize) + 1;

    const ms = nSteps * stepSize - (now - lastTime);

    lastTime = now + ms;

    timeout = setTimeout(_helper, ms);

    fn(nSteps * stepSize, ...args);
  };

  timeout = setTimeout(_helper, stepSize);

  return () => {
    clearTimeout(timeout);
  };
};
