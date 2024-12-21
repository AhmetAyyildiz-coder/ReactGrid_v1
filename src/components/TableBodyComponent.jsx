import React from 'react';
import { TableBody, TableRow, TableCell } from '@mui/material';

const TableBodyComponent = ({ columns, data }) => {
    return (
        <TableBody>
            {data.map((item) => (
                <TableRow
                    key={item.customerId}
                    hover
                >
                    {columns.map((column) => (
                        <TableCell key={column.id}>
                            {item[column.id]}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
};

export default TableBodyComponent; 