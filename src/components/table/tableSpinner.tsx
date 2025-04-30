import React from 'react';

import TableRow from './tableRow';
import TableCell from './tableCell';
import { FiLoader } from 'react-icons/fi';

interface IProps {
    colSpan: number;
}
const TableSpinner: React.FC<IProps> = ({ colSpan }) => (
    <TableRow>
        <TableCell colSpan={colSpan}>
            <FiLoader />
        </TableCell>
    </TableRow>
);

export default TableSpinner;
