import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Heading, Text, List, ListItem } from "@chakra-ui/react";
export default function Default_Layout() {
  const md = `---
<www.nisith.com>
# Hello
**Vite!**\n\n- This is a list\n- With some items\n\n
---
[goto](wwwm)
> hekkiw`;
  return (
    <>
      <div className=" w-full h-full flex flex-col justify-center items-center">
        <h1>wellcome to my template </h1>
        <div id="md" className=" w-full h-full">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
