import { Store } from "tauri-plugin-store-api";
import { DEFAULT_TIME } from "./constants";

export const useStore = () => {
  const store = new Store(".settings.dat");

  const getInitialTime = async () => {
    const storedTime = await store?.get<number>("initial-time");

    if (storedTime === null) {
      return DEFAULT_TIME;
    }

    return storedTime;
  };

  const setInitialTime = async (time: number) => {
    await store?.set("initial-time", time);
  };

  const getVolume = async () => {
    const storedVolume = await store?.get<number>("volume");

    if (storedVolume === null) {
      return 100;
    }

    return storedVolume;
  };

  const setVolume = async (volume: number) => {
    await store?.set("volume", volume);
  };

  const setTheme = async (theme: string) => {
    await store?.set("theme", theme);
  };

  const getTheme = async () => {
    const storedTheme = await store?.get<string>("theme");

    if (storedTheme === null) {
      return "";
    }

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
