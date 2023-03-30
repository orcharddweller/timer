import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import { create } from "zustand";
import { DEFAULT_TIME } from "./constants";
import { TimerState } from "./types";

const store = new Store(".settings.dat");

export interface TimerStore {
  time: number;
  state: TimerState;
  initialTime: number;
  volume: number;
  theme: string;
  step: (dt: number) => Promise<void>;
  reset: () => Promise<void>;
  setState: (state: TimerState) => Promise<void>;
  setInitialTime: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
}

export const useStore = create<TimerStore>()((set) => ({
  time: DEFAULT_TIME,
  state: "stopped",
  initialTime: DEFAULT_TIME,
  volume: 1,
  theme: "light",
  step: async (dt) => {
    set((state) => ({ time: state.time - dt }));
  },
  reset: async () => {
    set((state) => ({ time: state.initialTime }));
  },
  setState: async (state) => {
    set({ state });
  },
  setInitialTime: async (time) => {
    set({ initialTime: time });
    set({ time });
    await store.set("initial-time", time);
    store.save();
  },
  setVolume: async (volume) => {
    set({ volume: volume });
    await invoke("set_volume", { volume: volume / 100 });
  },
  setTheme: async (theme) => {
    set({ theme: theme });

    document.querySelector("html").setAttribute("data-theme", theme);
    await store.set("theme", theme);

    store.save();
  },
}));

store.get<number>("initial-time").then((time) => {
  useStore.setState({ initialTime: time });
  useStore.setState({ time });
});

store.get<number>("volume").then((volume) => {
  useStore.setState({ volume: volume });
});

store.get<string>("theme").then((theme) => {
  useStore.setState({ theme: theme });

  document.querySelector("html").setAttribute("data-theme", theme);
});
