import { FC, PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  style?: Record<string, any>;
  className?: string;
  colSpan?: number;
  title?: string;
  onClick?: () => void;
}

const TableCell: FC<IProps> = (props) => {
  return (
    <td
      className={`${props.className ?? ''} p-3`}
      colSpan={props.colSpan}
      style={props.style}
      title={props.title}
      onClick={props.onClick}
    >
      {props.children}
    </td>
  );
};

export default TableCell;
