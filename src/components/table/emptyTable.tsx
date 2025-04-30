import React from 'react';

import TableRow from './tableRow';
import TableCell from './tableCell';

const EmptyTable: React.FC<{
	text: string;
	colSpan: number;
}> = (props) => {
	return (
		<TableRow className='text-center'>
			<TableCell colSpan={props.colSpan}>
				<p className='text-textGray text-sm'>{props.text}</p>
			</TableCell>
		</TableRow>
	);
};

export default EmptyTable;
