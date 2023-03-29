import { useEffect } from "react";
import { useSettings } from "./use-settings";

const Initializer = () => {
  const { getTheme } = useSettings();

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
