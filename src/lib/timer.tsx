import { useCallback, useEffect, useState } from "react";
import PlayIcon from "../assets/icons/play.svg";
import RestartIcon from "../assets/icons/restart.svg";
import StopIcon from "../assets/icons/stop.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import { invoke } from "@tauri-apps/api/tauri";
import Settings from "./settings";
import { setSkippingInterval } from "./set-interval/setSkippingInterval";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

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
  const { time, state, reset, step, setInitialTime, setState } = useStore(
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
  const [inSettings, setInSettings] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInputTime(value);

    const parsedTime = parseTime(value);

    setInitialTime(parsedTime);
  }, []);

  useEffect(() => {
    if (time > 0 || state !== "running") {
      return;
    }

    setState("alarmed");
    invoke("play_sound");
  }, [time, state]);

  useEffect(() => {
    if (state !== "running") {
      return;
    }

    const clear = setSkippingInterval((dt) => {
      step(dt / 1000);
    }, 1000);

    return clear;
  }, [state]);

  useEffect(() => {
    if (state !== "stopped") {
      return;
    }

    setInputTime(formatTime(time));
  }, [state, time]);

  if (inSettings && state !== "alarmed") {
    return <Settings onBack={() => setInSettings(false)} />;
  }

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
          <SettingsIcon
            onClick={() => setInSettings(true)}
            className={`w-6 h-6 absolute right-1 ${
              state === "alarmed" ? "invisible" : ""
            }`}
          />
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
                reset();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
