import AppRoute from "./route/_app_route";
import useGlobalState from "@/global/STATE_USE";
export default function App() {
  const GLOBAL = useGlobalState();
  function handleLoad() {
    console.log("Global State setup " + GLOBAL.loading);
    console.log("onload function App has setup!");
    window.removeEventListener("load", handleLoad); // Remove the listener after it's fired
  }
  window.addEventListener("load", handleLoad);

  return (
    <div className="w-screen h-screen overflow-hidden ">
      <AppRoute />
    </div>
  );
}
