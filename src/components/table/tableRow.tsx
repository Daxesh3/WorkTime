import { FC, MouseEvent, PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
	className?: string;
	onClick?: (event: MouseEvent<HTMLTableRowElement>) => void;
	disabled?: boolean;
}

const TableRow: FC<IProps> = ({ disabled, onClick, children, className }) => {
	return (
		<tr
			className={`border-b border-[#E7EEF9] ${className ?? ''} ${disabled ? 'pointer-events-none opacity-40' : ''}`}
			onClick={onClick}
		>
			{children}
		</tr>
	);
};

export default TableRow;
