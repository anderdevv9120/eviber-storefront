import { IComboCard } from "@/@types/Combo.type";
import ComboCardItem from "./ComboCardItem";

const ComboCardList = ({ combos }: { combos: IComboCard[] }) => {
  if (combos.length === 0) return null;

  return (
    <div className="grid grid-flow-col auto-cols-[calc((100%_-_0.625rem)/2)] md:auto-cols-[calc((100%_-_2rem)/3)] lg:auto-cols-[calc((100%_-_4rem)/5)] gap-2.5 md:gap-4 overflow-x-auto pb-2">
      {combos.map((combo) => (
        <ComboCardItem key={combo._id} combo={combo} />
      ))}
    </div>
  );
};

export default ComboCardList;
