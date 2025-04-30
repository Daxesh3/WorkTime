import { FC, PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  className?: string;
}

const TableComponent: FC<IProps> = ({ className, children }) => {
  return (
    <div
      className={`${className ?? ''} border-bg-theme w-full rounded-t-md border`}
    >
      <table className='relative w-full text-gray-500'>{children}</table>
    </div>
  );
};

export default TableComponent;
