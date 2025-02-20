import { Routes, Route } from "react-router";
///  import page route
import MainPage from "@/pages/main/main";
import PdfViewer from "@/components/pdfviewer";
// application route in main App
export default function MainRoute() {
  return (
    <>
      <Routes>
        <Route path="*" element={<h1>errror</h1>} />
        <Route path="/" element={<MainPage />} />
        <Route path="/x" element={<h1>main x</h1>} />
        <Route path="/render/pdf" element={<PdfViewer />} />
      </Routes>
    </>
  );
}
