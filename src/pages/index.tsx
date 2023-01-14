import { useCallback, useEffect, useState } from "react";
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

const parseTime = (time: string): number | null => {
  const [minutes, seconds] = time.split(":").map((x) => parseInt(x, 10));

  if (isNaN(minutes) || isNaN(seconds)) {
    return null;
  }

  return minutes * 60 + seconds;
};

const validateTime = (time: string) => {
  const match = time.match(/^\d{0,2}:(?:[0-5]\d?)?$/);

  return match !== null;
};

const Page = () => {
  const [time, setTime] = useState<number | null>(null);
  const [inputTime, _setInputTime] = useState(":");
  const [isInputWrong, setIsInputWrong] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const setInputTime = useCallback((value: string) => {
    _setInputTime(value);

    const parsedTime = parseTime(value);

    if (parsedTime === null) {
      setIsInputWrong(true);

      setTime(null);
      return;
    }

    setIsInputWrong(false);
    setTime(parsedTime);
  }, []);

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
      <div className="text-6xl font-mono font-bold">
        <input
          readOnly={isRunning}
          className={`block mx-auto w-52 text-center ${
            isRunning ? "select-none" : ""
          }`}
          value={isRunning ? formatTime(time) : inputTime}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              // get colon position
              const colonPos = e.currentTarget.value.indexOf(":");

              if (e.currentTarget.selectionStart === colonPos + 1) {
                e.currentTarget.setSelectionRange(colonPos, colonPos);
              }
            }
          }}
          onChange={(e) => {
            const newValue = e.target.value;

            if (newValue.length === 0) {
              setInputTime(":");
              return;
            }

            if (!validateTime(newValue)) {
              return;
            }
            setInputTime(newValue);

            if (newValue.length === 3) {
              if (
                e.currentTarget.selectionStart === 2 &&
                e.currentTarget.selectionEnd === 2
              ) {
                e.currentTarget.setSelectionRange(3, 3);
              }
            }
          }}
        />
      </div>
      <div className="flex justify-around mt-4">
        <StopIcon
          className={`w-10 h-10 
          ${isInputWrong ? "stroke-red-500" : "hover:stroke-gray-500"}`}
          onClick={() => {
            setIsRunning(false);

            if (time === null) {
              return;
            }

            _setInputTime(formatTime(time));
          }}
        />
        <PlayIcon
          className={`w-10 h-10 
          ${isInputWrong ? "stroke-red-500" : "hover:stroke-gray-500"}`}
          disabled={isInputWrong}
          onClick={() => {
            if (isInputWrong) {
              return;
            }
            setIsRunning(true);
          }}
        />
        <RestartIcon
          className={`w-10 h-10  ${
            isInputWrong ? "stroke-red-500" : "hover:stroke-gray-500"
          }`}
          disabled={isInputWrong}
          onClick={() => {
            if (isInputWrong) {
              return;
            }
            setTime(DEFAULT_TIME);
          }}
        />
      </div>
    </div>
  );
};

export default Page;
