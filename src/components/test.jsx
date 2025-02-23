import { useEffect, useRef } from "react";

export default function Test() {
  const lazyload = new IntersectionObserver((entry) => {
    console.log(entry[0]);
  });
  const myref = useRef();

  useEffect(() => {
    lazyload.observe(myref.current);
  });
  return (
    <div className="w-full   flex flex-col    gap-10  ">
      <div className=" w-full flex-col flex items-center gap-10 overflow-scroll">
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300"></div>
        <div className="h-100 w-100 bg-amber-300">
          <h1 ref={myref}>helloh</h1>
        </div>
      </div>
    </div>
  );
}
