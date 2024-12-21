import React, { useState } from 'react';
import {
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TextField,
    IconButton
} from '@mui/material';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

const TableBodyComponent = ({ 
    columns, 
    data, 
    selectedRows, 
    onRowClick, 
    isSelected, 
    onCellEdit,
    groupBy,
    onToggleGroup
}) => {
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
            {data.map((row, index) => {
                if (row.isGroupHeader) {
                    return (
                        <TableRow
                            key={`group-${row.groupValue}`}
                            sx={{ 
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                cursor: 'pointer'
                            }}
                            onClick={() => onToggleGroup(row.groupValue)}
                        >
                            <TableCell padding="checkbox">
                                <IconButton size="small">
                                    {row.isExpanded ? 
                                        <ChevronDown className="w-4 h-4" /> : 
                                        <ChevronRight className="w-4 h-4" />
                                    }
                                </IconButton>
                            </TableCell>
                            <TableCell 
                                colSpan={columns.length} 
                                sx={{ fontWeight: 'bold' }}
                            >
                                {`${columns.find(c => c.id === groupBy)?.label}: ${row.groupValue} (${row.count})`}
                            </TableCell>
                        </TableRow>
                    );
                }

                const isItemSelected = isSelected(row.orderId);

                return (
                    <TableRow
                        hover
                        key={row.orderId}
                        selected={isItemSelected}
                    >
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isItemSelected}
                                onChange={() => onRowClick(row.orderId)}
                            />
                        </TableCell>
                        {columns.map((column) => (
                            <TableCell 
                                key={`${row.orderId}_${column.id}`}
                                onDoubleClick={() => handleDoubleClick(row.orderId, column.id, row[column.id])}
                                sx={{ cursor: 'pointer' }}
                            >
                                {isEditing(row.orderId, column.id) ? (
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