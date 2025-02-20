import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useColorMode } from "@/components/ui/color-mode";
export default function Login() {
  const link = useNavigate();
  return (
    <div className="w-full h-full">
      <Button onClick={() => link("/")}>home</Button>
      <Button>
        <a href="https://chakra-ui.com">Chakra UI</a>
      </Button>
      <h1>hell</h1>
    </div>
  );
}
