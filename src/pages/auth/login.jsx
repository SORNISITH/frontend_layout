import { useNavigate } from "react-router";
export default function Login() {
  const link = useNavigate();
  return (
    <div className="w-full h-full">
      <h1>hello this login page</h1>
    </div>
  );
}
