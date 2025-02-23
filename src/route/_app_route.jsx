import { Routes, Route } from "react-router";
///  import page route
import Default_Layout from "@/layouts/default_layout";
import Login from "@/pages/auth/login";
import PdfPage from "@/components/pdfview";
import Test from "@/components/test";
//@ application route in main App
export default function AppRoute() {
  return (
    <>
      <Routes>
        <Route path="/*" element={<Default_Layout key={"app:default"} />} />
        <Route path="/login" element={<Login key={"app:login"} />} />
        <Route path="/forget" element={<h1>forget</h1>} />
        <Route path="/pdfview/*" element={<PdfPage />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </>
  );
}
