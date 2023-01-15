import { invoke } from "@tauri-apps/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./use-store";
import SettingsIcon from "../assets/icons/settings-filled.svg";
import { THEMES } from "./constants";

export interface SettingsProps {
  onBack: () => void;
}

const Settings = (props: SettingsProps) => {
  const [volumeInput, setVolumeInput] = useState<number | null>(null);
  const [themeInput, setThemeInput] = useState<string | null>(null);
  const { getVolume, setVolume, getTheme, setTheme } = useStore();

  useEffect(() => {
    const init = async () => {
      setVolumeInput(await getVolume());
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      setThemeInput(await getTheme());
    };

    init();
  }, []);

  if (volumeInput === null) {
    return null;
  }

  return (
    <div>
      <SettingsIcon
        onClick={props.onBack}
        className={"w-6 h-6 absolute right-1"}
      />
      <div className="p-2">
        <h1 className="text-center text-3xl font-bold font-mono">Settings</h1>

        <div className="p-2">
          <h2 className="text-lg font-mono">Volume:</h2>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeInput}
            className="range range-xs"
            onChange={(e) => {
              setVolumeInput(e.target.valueAsNumber);
              setVolume(e.target.valueAsNumber);
              invoke("set_volume", { volume: e.target.valueAsNumber / 100 });
            }}
          />
        </div>
        <select
          data-choose-theme
          className="select select-sm select-ghost w-full max-w-xs"
          value={themeInput}
          onChange={(e) => {
            const theme = e.target.value;

            setThemeInput(theme);
            setTheme(theme);
            document.querySelector("html").setAttribute("data-theme", theme);
          }}
        >
          {THEMES.map((theme) => (
            <option value={theme}>{theme}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Settings;
