import React, { PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  className?: string;
}

const TableHead: React.FC<IProps> = ({ className = '', children }) => {
  return (
    <thead
      className={`${className} border-bg-theme bg-light/30 sticky top-0 z-10 border-b`}
    >
      <tr>{children}</tr>
    </thead>
  );
};

export default TableHead;
