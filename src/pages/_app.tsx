import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

import "../style.css";

const Initializer = dynamic(() => import("../lib/initializer"), { ssr: false });

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Initializer />
      <Component {...pageProps} />
    </>
  );
}
