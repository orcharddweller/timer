import { createContext, Dispatch, SetStateAction, useState } from "react";

export const ClockContext = createContext<
  [number | null, Dispatch<SetStateAction<number | null>>]
>([null, () => {}]);

export interface ClockProviderProps {
  children: React.ReactNode;
}

export const ClockProvider = (props: ClockProviderProps) => {
  const [time, setTime] = useState<number | null>(null);

  return (
    <ClockContext.Provider value={[time, setTime]}>
      {props.children}
    </ClockContext.Provider>
  );
};
