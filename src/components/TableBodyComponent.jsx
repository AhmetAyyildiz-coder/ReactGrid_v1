import React from 'react';
import { TableBody, TableRow, TableCell, Checkbox } from '@mui/material';

const TableBodyComponent = ({ columns, data, selectedRows, onRowClick, isSelected }) => {
    return (
        <TableBody>
            {data.map((item) => {
                const isItemSelected = isSelected(item.customerId);
                const labelId = `enhanced-table-checkbox-${item.customerId}`;

                return (
                    <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={item.customerId}
                        selected={isItemSelected}
                        onClick={() => onRowClick(item.customerId)}
                        style={{ cursor: 'pointer' }}
                    >
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isItemSelected}
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </TableCell>
                        {columns.map((column) => (
                            <TableCell key={column.id}>
                                {item[column.id]}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            })}
        </TableBody>
    );
};

export default TableBodyComponent; 