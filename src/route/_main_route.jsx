import { Routes, Route } from "react-router";
///  import page route
import MainPage from "@/pages/main/main";
import NoteFound from "@/pages/404";
// application route in main App
export default function MainRoute() {
  return (
    <>
      <Routes>
        <Route path="*" element={<NoteFound />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </>
  );
}
