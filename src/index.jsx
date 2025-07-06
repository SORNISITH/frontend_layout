import StateProvider from "./global/STATE_PROVIDER.jsx";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <StateProvider>
        <App key={"root:app"} />
      </StateProvider>
    </BrowserRouter>
  </StrictMode>,
);
