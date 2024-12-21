import React, { useState } from 'react';
import {
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TextField,
    IconButton
} from '@mui/material';
import { Check, X } from 'lucide-react';

const TableBodyComponent = ({ columns, data, selectedRows, onRowClick, isSelected, onCellEdit }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleDoubleClick = (rowId, columnId, currentValue) => {
        setEditingCell({ rowId, columnId });
        setEditValue(currentValue);
    };

    const handleEditCancel = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleEditSave = async () => {
        debugger;
        if (!editingCell) return;

        const success = await onCellEdit(
            editingCell.rowId,
            editingCell.columnId,
            editValue
        );

        if (success) {
            setEditingCell(null);
            setEditValue('');
        }
    };

    const isEditing = (rowId, columnId) => 
        editingCell?.rowId === rowId && editingCell?.columnId === columnId;

    return (
        <TableBody>
            {data.map((row) => {
                const isItemSelected = isSelected(row.customerId);

                return (
                    <TableRow
                        hover
                        key={row.customerId}
                        selected={isItemSelected}
                    >
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isItemSelected}
                                onChange={() => onRowClick(row.customerId)}
                            />
                        </TableCell>
                        {columns.map((column) => (
                            <TableCell 
                                key={column.id}
                                onDoubleClick={() => handleDoubleClick(row.customerId, column.id, row[column.id])}
                                sx={{ cursor: 'pointer' }}
                            >
                                {isEditing(row.customerId, column.id) ? (
                                    <TextField
                                        size="small"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        autoFocus
                                        fullWidth
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEditSave();
                                            }
                                            if (e.key === 'Escape') {
                                                handleEditCancel();
                                            }
                                        }}
                                        onBlur={handleEditSave}
                                    />
                                ) : (
                                    <span>{row[column.id]}</span>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            })}
        </TableBody>
    );
};

export default TableBodyComponent; 