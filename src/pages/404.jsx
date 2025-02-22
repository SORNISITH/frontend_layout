import FuzzyText from "@/jsrepo/FuzzyText/FuzzyText";
export default function NoteFound() {
  return (
    <div className="cursor-pointer  mt-10 gap-10  flex flex-col justify-center item-center">
      <div className=" flex justify-center items-center">
        <FuzzyText baseIntensity={0} hoverIntensity={0.25} enableHover={true}>
          404
        </FuzzyText>
      </div>
      <div className="flex  justify-center items-center">
        <FuzzyText baseIntensity={0.1} hoverIntensity={0.25} enableHover={true}>
          NOT FOUND
        </FuzzyText>
      </div>
    </div>
  );
}
