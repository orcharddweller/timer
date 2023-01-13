import { useEffect, useState } from "react";
import { setAccurateInterval } from "../lib/set-accurate-interval";

const DEFAULT_TIME = 30 * 60;

const formatTime = (time: number) => {
  time = Math.round(time);

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const Page = () => {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const clear = setAccurateInterval((dt) => {
      setTime((time) => time - dt);
    }, 0.01);

    return clear;
  }, [isRunning]);

  return (
    <div>
      <h1>Timer</h1>
      <div>
        <span>{formatTime(time)}</span>
        <div>
          <button
            onClick={() => {
              setIsRunning(true);
            }}
          >
            Start
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
            }}
          >
            Stop
          </button>
          <button
            onClick={() => {
              setTime(DEFAULT_TIME);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
