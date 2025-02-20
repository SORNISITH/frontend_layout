import MainRoute from "@/route/_main_route";
//  wrap each page responsive iritial size ---------------------------------------
const ResponsiveLayout = ({ children }) => {
  return (
    <div className="2xl:w-[50%] xl:w-[60%] lg:w-[70%] md:w-[80%]  w-[100%] h-[100%]  bg-gray-100    ">
      {children}
    </div>
  );
};
//--------------------------------------------------------------------------
export default function Default_Layout() {
  return (
    <div className=" w-full h-full flex flex-col justify-center items-center">
      <Gredient_Layout />
      <Nav_Layout />
      <Main_Layout />
      <Footer_Layout />
      <Gredient_Layout />
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
    <nav className="shadow-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 w-full h-14 sticky top-0 z-0  flex flex-col justify-center items-center ">
      <hr className="opacity-10" />
      <ResponsiveLayout></ResponsiveLayout>
      <hr className="opacity-20" />
    </nav>
  );
}
function Main_Layout() {
  return (
    <section className="w-full h-100 flex flex-col just items-center bg-zinc-50">
      <ResponsiveLayout>
        <MainRoute />
      </ResponsiveLayout>
    </section>
  );
}

function Footer_Layout() {
  return (
    <footer className="h-20 flex flex-col justify-center items-center w-full ">
      <ResponsiveLayout></ResponsiveLayout>
    </footer>
  );
}
