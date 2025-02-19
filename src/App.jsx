import { Routes, Route } from "react-router";
import useGlobalState from "@/global/STATE_USE";
import Error_Layout from "@/layouts/error_layout";
import Default_Layout from "@/layouts/default_layout";
import Login from "@/pages/auth/login";
import { DarkMode, LightMode, useColorMode } from "@/components/ui/color-mode";
export default function App() {
  const { toggleColorMode } = useColorMode();
  const GLOBAL = useGlobalState();
  function handleLoad() {
    console.log("Global State setup " + GLOBAL.loading);
    console.log("onload function App has setup!");
    window.removeEventListener("load", handleLoad); // Remove the listener after it's fired
  }
  window.addEventListener("load", handleLoad);

  return (
    <div className="w-screen h-screen">
      <Routes>
        <Route path="*" element={<Error_Layout key={"app:error"} />}></Route>
        <Route
          path="/"
          element={<Default_Layout key={"app:default"} />}
        ></Route>
        <Route path="/login" element={<Login key={"app:login"} />}></Route>
        <Route path="/forget" element={<h1>forget</h1>}></Route>
      </Routes>
    </div>
  );
}
