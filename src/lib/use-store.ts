import { useEffect, useState } from "react";
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

  return {
    getInitialTime,
    setInitialTime,
  };
};
