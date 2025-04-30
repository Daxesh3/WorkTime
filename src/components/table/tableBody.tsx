import { FC, PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
	className?: string;
}
const TableBody: FC<IProps> = ({ children, className }) => {
	return <tbody className={`bg-white ${className ?? ''}`}>{children}</tbody>;
};

export default TableBody;
