import { CustomDtSetInterval } from "./types";

export const setDtInterval: CustomDtSetInterval = (fn, stepSize, ...args) => {
  let time = Date.now();

  const interval = setInterval(() => {
    const now = Date.now();

    const dt = now - time;
    time = now;

    fn(dt, ...args);
  }, stepSize);

  return () => {
    clearInterval(interval);
  };
};
