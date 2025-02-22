import MainRoute from "@/route/_main_route";
//  wrap each page responsive iritial size ---------------------------------------
export const ResponsiveLayout = ({ children }) => {
  return (
    <div className="2xl:w-[50%] xl:w-[60%] lg:w-[70%] md:w-[80%]  w-[100%]    bg-gray-100    ">
      {children}
    </div>
  );
};
//--------------------------------------------------------------------------
export default function Default_Layout() {
  return (
    <div className=" w-full h-full flex flex-col  items-center">
      <Nav_Layout />
      <Main_Layout />
      <Footer_Layout />
    </div>
  );
}

function Gredient_Layout() {
  return (
    <div className="h-1 w-full">
      <div className="w-full h-full bg-linear-to-r/srgb from-indigo-500 to-teal-400"></div>
    </div>
  );
}
function Nav_Layout() {
  return (
    <nav className=" h-[7%] z-10 shadow-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 w-full  sticky top-0   flex flex-col justify-center items-center ">
      <Gredient_Layout />
      <ResponsiveLayout></ResponsiveLayout>
      <hr className="opacity-20" />
    </nav>
  );
}
function Main_Layout() {
  return (
    <section className="w-full h-[86%] flex flex-col overflow-none  items-center  bg-zinc-50">
      <ResponsiveLayout>
        <MainRoute />
      </ResponsiveLayout>
    </section>
  );
}

function Footer_Layout() {
  return (
    <footer className="h-[7%]  flex flex-col justify-center items-center w-full ">
      <ResponsiveLayout>
        <hr className="opacity-10" />

        <h1>nisith</h1>
        <h1>footer</h1>
      </ResponsiveLayout>
      <Gredient_Layout />
    </footer>
  );
}
