import { useEffect, useState } from "react";
import { setAccurateInterval } from "../lib/set-accurate-interval";
import PlayIcon from "../assets/play.svg";
import RestartIcon from "../assets/restart.svg";
import StopIcon from "../assets/stop.svg";

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
    <div className="p-1">
      <div className="text-6xl font-mono font-bold text-center">
        {formatTime(time)}
      </div>
      <div className="flex justify-around mt-4">
        <StopIcon
          className="w-10 h-10 hover:stroke-gray-500"
          onClick={() => {
            setIsRunning(false);
          }}
        />
        <PlayIcon
          className="w-10 h-10 hover:stroke-gray-500"
          onClick={() => {
            setIsRunning(true);
          }}
        />
        <RestartIcon
          className="w-10 h-10 hover:stroke-gray-500"
          onClick={() => {
            setTime(DEFAULT_TIME);
          }}
        />
      </div>
    </div>
  );
};

export default Page;
