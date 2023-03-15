import { CustomDtSetInterval } from "./types";

export const setExactlyOnceInterval: CustomDtSetInterval = (
  fn,
  stepSize,
  ...args
) => {
  let nextTime = Date.now() + stepSize;

  let timeout: NodeJS.Timeout;

  const _helper = () => {
    const now = Date.now();

    nextTime = nextTime + stepSize;

    let ms = nextTime - now;

    if (ms < 0) {
      ms = 0;
    }

    timeout = setTimeout(_helper, ms);

    fn(stepSize, ...args);
  };

  timeout = setTimeout(_helper, stepSize);

  return () => {
    clearTimeout(timeout);
  };
};
