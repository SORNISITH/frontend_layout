import FuzzyText from "@/component/jsrepo/FuzzyText/FuzzyText";
import LetterGlitch from "@/component/jsrepo/LetterGlitch/LetterGlitch";
export default function NoteFound({ docName }) {
  return (
    <div className="cursor-pointer w-full h-full  mt-10   flex flex-col justify-center item-center">
      <div className=" h-20  flex justify-center items-center">
        <FuzzyText baseIntensity={0} hoverIntensity={0.25} enableHover={true}>
          404
        </FuzzyText>
      </div>
      <div className="">
        <LetterGlitch />
      </div>
      <div className="flex  justify-center items-center">
        <h1 className="text-3xl md:text-5xl">Not FOUND - {docName}</h1>
      </div>
    </div>
  );
}
