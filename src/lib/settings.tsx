import SettingsIcon from "../assets/icons/settings-filled.svg";
import { THEMES } from "./constants";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

export interface SettingsProps {
  onBack: () => void;
}

const Settings = (props: SettingsProps) => {
  const { volume, theme, setVolume, setTheme } = useStore(
    (state) => ({
      volume: state.volume,
      theme: state.theme,
      setVolume: state.setVolume,
      setTheme: state.setTheme,
    }),
    shallow
  );

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
            value={volume}
            className="range range-xs"
            onChange={(e) => {
              setVolume(e.target.valueAsNumber);
            }}
          />
        </div>
        <select
          data-choose-theme
          className="select select-sm select-ghost w-full max-w-xs"
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value);
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
