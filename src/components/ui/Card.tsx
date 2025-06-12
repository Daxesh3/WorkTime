import { FC, ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  actionButton?: ReactNode;
}

const Card: FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = "",
  actionButton,
}) => {
  return (
    <div
      className={`card animate-fade-in-down animate-duration-300  ${className}`}
    >
      {(title || icon || actionButton) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
          <div className="flex items-center ">
            {icon && <div className="mr-3 text-primary-600">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-lg font-medium text-neutral-800">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

export default Card;
