import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { setSkippingInterval } from "./set-interval/setSkippingInterval";
import { useStore } from "./store";

export const TimerCore = () => {
  const { time, state, step, setState } = useStore(
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

  return null;
};

export default TimerCore;
