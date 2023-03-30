import { invoke } from "@tauri-apps/api/tauri";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

export interface AlarmProps {
  children: React.ReactNode;
}

const Alarm = (props: AlarmProps) => {
  const { state, setState } = useStore(
    (state) => ({
      state: state.state,
      setState: state.setState,
    }),
    shallow
  );

  if (state !== "alarmed") {
    return <>{props.children}</>;
  }

  return (
    <div className="overflow-clip h-screen select-none cursor-pointer">
      <div
        className={` ${state === "alarmed" ? "bg-success animate-ping" : ""}`}
        onClick={() => {
          if (state === "alarmed") {
            setState("stopped");
            invoke("stop_sound");
          }
        }}
      >
        <div className="text-center text-6xl font-mono font-bold h-screen flex items-center justify-center">
          <div>00:00</div>
        </div>
      </div>
    </div>
  );
};

export default Alarm;
