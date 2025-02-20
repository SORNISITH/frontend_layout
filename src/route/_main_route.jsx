import { Routes, Route } from "react-router";
///  import page route

//@ application route in main App
export default function MainRoute() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>main route</h1>} />
        <Route path="/main" element={<h1>main x</h1>} />
        <Route path="*" element={<h1>errror</h1>} />
      </Routes>
    </>
  );
}
