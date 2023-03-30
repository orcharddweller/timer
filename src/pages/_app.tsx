import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

import "../style.css";

const TimerCore = dynamic(() => import("../lib/timer-core"), { ssr: false });
const Alarm = dynamic(() => import("../lib/alarm"), { ssr: false });

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <TimerCore />
      <Alarm>
        <Component {...pageProps} />
      </Alarm>
    </>
  );
}
