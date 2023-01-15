import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";
import { useStore } from "./use-store";

const Initializer = () => {
  const { getVolume, getTheme } = useStore();

  useEffect(() => {
    const initVolume = async () => {
      const volume = await getVolume();

      invoke("set_volume", {
        volume,
      });
    };

    initVolume();
  }, []);

  useEffect(() => {
    const initTheme = async () => {
      const theme = await getTheme();

      document.querySelector("html").setAttribute("data-theme", theme);
    };

    initTheme();
  }, []);

  return null;
};

export default Initializer;
