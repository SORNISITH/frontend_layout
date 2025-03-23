import { Routes, Route } from "react-router";
///  import page route
import Default_Layout from "@/layouts/default_layout";
import PdfPage from "$/pdfview";
import Portfolio_App from "$/portfolio";

import Test from "@/components/test";
//@ application route in main App
export default function AppRoute() {
  return (
    <Routes>
      <Route path="/*" element={<Default_Layout key={"app:default"} />} />
      <Route path="/forget" element={<h1>forget</h1>} />
      <Route path="/pdfview/*" element={<PdfPage />} />
      <Route path="/portfolio/*" element={<Portfolio_App />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}
