export const setAccurateInterval = (
  fn: (dt: number) => void,
  stepSize: number
) => {
  let timer: NodeJS.Timeout;

  let drift = 0;
  let correction = 0;

  const _setAccurateInterval = (
    fn: (dt: number) => void,
    stepSize: number,
    lastCall: number
  ) => {
    const now = Date.now();

    const dt = (now - lastCall) / 1000;

    drift += stepSize - dt;

    fn(dt);

    timer = setTimeout(
      _setAccurateInterval,
      (stepSize + drift) * 1000,
      fn,
      stepSize,
      now
    );
  };

  timer = setTimeout(
    _setAccurateInterval,
    stepSize * 1000,
    fn,
    stepSize,
    Date.now()
  );

  return () => {
    clearTimeout(timer);
  };
};
