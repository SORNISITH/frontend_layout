import { useContext } from "react";
import StateContext from "./STATE_CONTEXT.jsx";
const useGlobalState = () => useContext(StateContext);
export default useGlobalState;
