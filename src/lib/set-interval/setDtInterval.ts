import { CustomDtSetInterval } from "./types";

export const setDtInterval: CustomDtSetInterval = (fn, stepSize, ...args) => {
  let time = Date.now();

  const interval = setInterval(() => {
    const dt = Date.now() - time;
    time = Date.now();

    fn(dt, ...args);
  }, stepSize);

  return () => {
    clearInterval(interval);
  };
};
