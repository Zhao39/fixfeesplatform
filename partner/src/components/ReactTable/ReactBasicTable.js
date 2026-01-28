import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';
// third-party
import { useTable } from 'react-table';

// ==============================|| REACT TABLE ||============================== //

const ReactBasicTable = (props) => {
    const { columns, data, hasFooter = true, loading } = props;
    const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = useTable({
        columns,
        data
    });

    return (
        <Table {...getTableProps()}>
            {/* Render Table Head */}
            <TableHead>
                {headerGroups.map((headerGroup) => {
                    const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps(); // Extract key
                    return (
                        <TableRow key={headerGroupKey} {...headerGroupProps}>
                            {headerGroup.headers.map((column) => {
                                const { key: columnKey, ...columnProps } = column.getHeaderProps([{ className: column.className }]); // Extract key
                                return (
                                    <TableCell key={columnKey} {...columnProps}>
                                        {column.render('Header')}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </TableHead>

            {/* Render Table Body */}
            {loading ? (
                <TableBody {...getTableBodyProps()}>
                    <TableRow>
                        <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                            Loading...
                        </TableCell>
                    </TableRow>
                </TableBody>
            ) : (
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        const { key: rowKey, ...rowProps } = row.getRowProps(); // Extract key
                        return (
                            <TableRow key={rowKey} {...rowProps}>
                                {row.cells.map((cell) => {
                                    const { key: cellKey, ...cellProps } = cell.getCellProps([{ className: cell.column.className }]); // Extract key
                                    return (
                                        <TableCell key={cellKey} {...cellProps}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            )}

            {/* Render Table Footer */}
            {hasFooter && (!loading) && (
                <TableFooter>
                    {footerGroups.map((footerGroup) => {
                        const { key: footerGroupKey, ...footerGroupProps } = footerGroup.getFooterGroupProps(); // Extract key
                        return (
                            <TableRow key={footerGroupKey} {...footerGroupProps}>
                                {footerGroup.headers.map((column) => {
                                    const { key: columnKey, ...columnProps } = column.getFooterProps([{ className: column.className }]); // Extract key
                                    return (
                                        <TableCell key={columnKey} {...columnProps}>
                                            {column.render('Footer')}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableFooter>
            )}
        </Table>
    );
};

ReactBasicTable.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    loading: PropTypes.bool,
    hasFooter: PropTypes.bool,
};

export default ReactBasicTable;
