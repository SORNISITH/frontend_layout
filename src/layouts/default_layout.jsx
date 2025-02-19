export default function Default_Layout() {
  return (
    <>
      <div className=" w-full h-full flex flex-col justify-center items-center">
        <h1>wellcome to my template </h1>

        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Features
          </h2>
          <ul className="list-disc pl-5 space-y-4 text-lg">
            <li>Chakra UI for flexible and customizable UI components.</li>
            <li>TailwindCSS for utility-first CSS styling.</li>
            <li>
              React and React Router for building interactive UIs and handling
              client-side routing.
            </li>
            <li>
              Next-Themes for easy theme switching between light and dark modes.
            </li>
            <li>Axios for making HTTP requests.</li>
            <li>ESLint setup for better code quality and consistency.</li>
            <li>clsx utility for conditional class names.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
