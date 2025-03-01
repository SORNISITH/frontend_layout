import { useState, createContext, useContext } from "react";
import StateContext from "./STATE_CONTEXT.jsx";
export default function StateProvider({ children }) {
  const [loading, setLoading] = useState(true); // onload window
  return (
    <StateContext.Provider value={{ loading, setLoading }}>
      {children}
    </StateContext.Provider>
  );
}
