import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import { create } from "zustand";
import { DEFAULT_TIME } from "./constants";
import { TimerState } from "./types";
import { z } from "zod";

const tauriStore = new Store(".settings.dat");

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
  _hydrated: boolean;
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
    await tauriStore.set("initial-time", time);
    tauriStore.save();
  },
  setVolume: async (volume) => {
    set({ volume: volume });
    await invoke("set_volume", { volume: volume / 100 });
  },
  setTheme: async (theme) => {
    set({ theme: theme });

    document.querySelector("html")?.setAttribute("data-theme", theme);
    await tauriStore.set("theme", theme);

    tauriStore.save();
  },
  _hydrated: false,
}));

const hydrate = async () => {
  const time = await tauriStore.get("initial-time");
  const volume = await tauriStore.get("volume");
  const theme = await tauriStore.get("theme");

  const parsedTime = z.number().safeParse(time);
  const parsedVolume = z.number().safeParse(volume);
  const parsedTheme = z.string().safeParse(theme);

  if (parsedTime.success) {
    useStore.setState({ initialTime: parsedTime.data });
    useStore.setState({ time: parsedTime.data });
  }

  if (parsedVolume.success) {
    useStore.setState({ volume: parsedVolume.data });
  }

  if (parsedTheme.success) {
    useStore.setState({ theme: parsedTheme.data });

    document
      .querySelector("html")
      ?.setAttribute("data-theme", parsedTheme.data);
  }

  useStore.setState({ _hydrated: true });
};

hydrate();
