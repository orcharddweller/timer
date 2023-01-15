import dynamic from "next/dynamic";

const Page = dynamic(() => import("../lib/settings"), { ssr: false });

export default Page;
