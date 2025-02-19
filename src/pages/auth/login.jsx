import { Button } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
export default function Login() {
  const { toggleColorMode } = useColorMode();
  return (
    <div className="w-full h-full">
      <Button onClick={toggleColorMode}>hello</Button>
      <Button>
        <a href="https://chakra-ui.com">Chakra UI</a>
      </Button>
      <h1>hell</h1>
    </div>
  );
}
