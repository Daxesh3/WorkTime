import { FC, ReactNode } from "react";
import { FiUsers } from "react-icons/fi";

export interface CardProps {
  title?: string;
  subtitle?: string;
  buttons?: ReactNode;
}

const TitleText: FC<CardProps> = ({ title, subtitle, buttons }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-4 py-3 animate-fade-in-down animate-duration-300">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">{title}</h1>
        <p className="text-neutral-500 mt-1">{subtitle}</p>
      </div>
      {buttons}
    </div>
  );
};

export default TitleText;
