import { useCallback, useContext, useEffect, useState } from "react";
import { setAccurateInterval } from "./set-accurate-interval";
import PlayIcon from "../assets/icons/play.svg";
import RestartIcon from "../assets/icons/restart.svg";
import StopIcon from "../assets/icons/stop.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { TimerState } from "./types";
import { useStore } from "./use-store";
import Link from "next/link";
import { ClockContext } from "./clock-context";

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
  const [time, setTime] = useContext(ClockContext);
  const [inputTime, setInputTime] = useState<string | null>(null);
  const [state, setState] = useState<TimerState>("stopped");

  const { getInitialTime, setInitialTime } = useStore();

  useEffect(() => {
    const init = async () => {
      const initialTime = await getInitialTime();

      setTime(initialTime);
      setInputTime(formatTime(initialTime));
    };

    init();
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInputTime(value);

    const parsedTime = parseTime(value);

    if (parsedTime === null) {
      setTime(null);
      return;
    }

    setTime(parsedTime);
    setInitialTime(parsedTime);
  }, []);

  useEffect(() => {
    if (time === null || time > 0 || state !== "running") {
      return;
    }

    setTime(0);
    setInputTime(formatTime(0));
    setState("alarmed");
    invoke("play_sound");
  }, [time, state]);

  useEffect(() => {
    if (state !== "running") {
      return;
    }

    const clear = setAccurateInterval((dt) => {
      setTime((time) => time - dt);
    }, 0.01);

    return clear;
  }, [state]);

  return (
    <div className="overflow-clip h-screen">
      <div
        className={`select-none ${
          state === "alarmed" ? "animate-ping bg-success" : ""
        }`}
        onClick={() => {
          if (state === "alarmed") {
            setState("stopped");
            invoke("stop_sound");
          }
        }}
      >
        <div className={state === "alarmed" ? "pointer-events-none" : ""}>
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
            <StopIcon
              className={`w-10 h-10 
          ${time === null ? "stroke-error" : "hover:stroke-primary"}`}
              onClick={() => {
                setState("stopped");

                if (time === null) {
                  return;
                }

                setInputTime(formatTime(time));
              }}
            />
            <PlayIcon
              className={`w-10 h-10 
          ${time === null ? "stroke-error" : "hover:stroke-primary"}`}
              onClick={() => {
                if (time === null || time <= 0) {
                  return;
                }
                setState("running");
              }}
            />
            <RestartIcon
              className={`w-10 h-10  ${
                time === null ? "stroke-error" : "hover:stroke-primary"
              }`}
              onClick={async () => {
                if (time === null) {
                  return;
                }
                setTime(await getInitialTime());
                setInputTime(formatTime(await getInitialTime()));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
