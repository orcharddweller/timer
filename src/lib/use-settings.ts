import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import { DEFAULT_TIME } from "./constants";

const store = new Store(".settings.dat");

export const useSettings = () => {
  const getInitialTime = async () => {
    const storedTime =
      (await store?.get<number>("initial-time")) ?? DEFAULT_TIME;

    return storedTime;
  };

  const setInitialTime = async (time: number) => {
    await store.set("initial-time", time);

    store.save();
  };

  const getVolume = async () => {
    const storedVolume = (await store?.get<number>("volume")) ?? 1;

    return storedVolume * 100;
  };

  const setVolume = async (volume: number) => {
    invoke("set_volume", { volume: volume / 100 });
  };

  const setTheme = async (theme: string) => {
    document.querySelector("html").setAttribute("data-theme", theme);
    await store.set("theme", theme);

    store.save();
  };

  const getTheme = async () => {
    const storedTheme = (await store?.get<string>("theme")) ?? "";

    return storedTheme;
  };

  return {
    getInitialTime,
    setInitialTime,
    getVolume,
    setVolume,
    setTheme,
    getTheme,
  };
};
