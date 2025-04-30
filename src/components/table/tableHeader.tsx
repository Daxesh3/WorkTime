import { FC } from 'react';

import Head from './tableHead';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { MdArrowDropUp } from 'react-icons/md';
import { ISortData } from '../../shared/types';
import { OrderType } from '../../shared/types/enum';

export interface ITableCell {
    title: string;
    style?: IObj;
    key: string;
    sortable?: boolean;
    tooltip?: boolean;
    align?: 'center' | 'start' | 'end' | 'between';
}
export interface IObj {
    [key: string]: string | number;
}

export interface ITableHeadProps {
    tableCellList: ITableCell[];
    sortData?: ISortData;
    onSort?: (sortData: ISortData) => void;
    className?: string;
    headerTitleClassName?: string;
}

const TableHeader: FC<ITableHeadProps> = ({ tableCellList, sortData, onSort, className = '', headerTitleClassName = '' }) => {
    const onClick = (shortKey: string) => {
        if (onSort) {
            let order: OrderType | '' = OrderType.ASC;
            if (sortData && sortData.sortBy === shortKey) {
                if (sortData.order === OrderType.ASC) {
                    order = OrderType.DESC;
                } else if (sortData.order === OrderType.DESC) {
                    order = OrderType.ASC;
                    // } else if (sortData.order === '') {
                    // 	order = OrderType.ASC;
                }
            }
            onSort({ sortBy: shortKey, order });
        }
    };

    return (
        <Head className={className}>
            {tableCellList.map(({ title, style, sortable, key, align = 'between' }, index) => {
                const isSelected = sortData?.sortBy === key;
                return (
                    <th
                        key={index}
                        className={`text-textGray text-sm-responsive relative text-sm font-semibold capitalize ${
                            sortable ? 'cursor-pointer' : ''
                        } px-2 py-2 select-none`}
                        style={style}
                        onClick={() => sortable && onClick(key)}
                    >
                        <div className={`${headerTitleClassName} items-center justify-${align} flex text-nowrap`}>
                            <div>{title}</div>

                            {!isSelected && sortable && <MdArrowDropUp className={`ml-2 size-[16px] transition-transform`} />}
                            {sortData?.order === OrderType.ASC && isSelected && sortable && (
                                <FaArrowUp className={`ml-2 size-[16px] transition-transform`} />
                            )}
                            {sortData?.order === OrderType.DESC && isSelected && sortable && (
                                <FaArrowDown className={`ml-2 size-[16px] transition-transform`} />
                            )}
                        </div>
                        {tableCellList.length !== index + 1 && (
                            <div
                                className={`absolute top-1/2 right-0 z-10 h-[20px] w-[5px] -translate-y-1/2`}
                                style={{
                                    background: 'linear-gradient(90deg, transparent 44%, #D1D5DB 45%, #D1D5DB 55%, transparent 56%)',
                                }}
                            ></div>
                        )}
                    </th>
                );
            })}
        </Head>
    );
};

export default TableHeader;
