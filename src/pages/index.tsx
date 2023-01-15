import dynamic from "next/dynamic";

const Page = dynamic(() => import("../lib/timer"), { ssr: false });

export default Page;
