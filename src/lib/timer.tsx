import { useCallback, useEffect, useState } from "react";
import PlayIcon from "../assets/icons/play.svg";
import RestartIcon from "../assets/icons/restart.svg";
import StopIcon from "../assets/icons/stop.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";
import Link from "next/link";

const formatTime = (time: number) => {
  time = Math.round(time);

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const parseTime = (time: string): number | null => {
  const [minutes, seconds] = time.split(":");

  if (!minutes.match(/^\d+$/) || !seconds.match(/^[0-5]\d$/)) {
    return null;
  }

  return parseInt(minutes) * 60 + parseInt(seconds);
};

const validateTime = (time: string) => {
  const match = time.match(/^\d{0,2}:(?:[0-5]\d?)?$/);

  return match !== null;
};

const Timer = () => {
  const { time, state, reset, setInitialTime, setState } = useStore(
    (state) => ({
      time: state.time,
      state: state.state,
      step: state.step,
      reset: state.reset,
      setInitialTime: state.setInitialTime,
      setState: state.setState,
    }),
    shallow
  );

  const [inputTime, setInputTime] = useState<string | null>(formatTime(time));

  const handleInputChange = useCallback((value: string) => {
    setInputTime(value);

    const parsedTime = parseTime(value);

    setInitialTime(parsedTime);
  }, []);

  useEffect(() => {
    if (state !== "stopped") {
      return;
    }

    setInputTime(formatTime(time));
  }, [state, time]);

  return (
    <div>
      <Link href="/settings">
        <SettingsIcon
          className={`w-6 h-6 absolute right-1 ${
            state === "alarmed" ? "invisible" : ""
          }`}
        />
      </Link>
      <div className="text-6xl font-mono font-bold p-1">
        <input
          readOnly={state !== "stopped"}
          className={`block mx-auto w-52 text-center bg-inherit ${
            state === "running" ? "select-none" : ""
          }`}
          value={state === "running" ? formatTime(time) : inputTime}
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
              handleInputChange(":");
              return;
            }

            if (newValue.match(/^\d$/)) {
              handleInputChange(`${newValue}:`);
              return;
            }

            if (!validateTime(newValue)) {
              return;
            }
            handleInputChange(newValue);

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
        <button
          onClick={() => {
            setState("stopped");
          }}
        >
          <StopIcon
            className={`w-10 h-10 
          ${time === null ? "stroke-error" : "hover:stroke-primary"}`}
          />
        </button>
        <button
          onClick={() => {
            if (time === null || time <= 0) {
              return;
            }
            setState("running");
          }}
        >
          <PlayIcon
            className={`w-10 h-10 
          ${time === null ? "stroke-error" : "hover:stroke-primary"}`}
          />
        </button>
        <button
          onClick={async () => {
            reset();
          }}
        >
          <RestartIcon
            className={`w-10 h-10  ${
              time === null ? "stroke-error" : "hover:stroke-primary"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default Timer;
