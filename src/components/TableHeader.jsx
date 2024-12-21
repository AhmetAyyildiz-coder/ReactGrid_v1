import React from 'react';
import { TableHead, TableRow, TableCell, Box, Typography, IconButton, Checkbox, TextField } from '@mui/material';
import { ChevronDown, Search } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const TableHeader = ({ columns, selectedValues, handleFilterClick, numSelected, rowCount, onSelectAllClick, searchValues, onSearchChange, dateFilters, onDateFilterChange }) => {
    const isAllSelected = rowCount > 0 && numSelected === rowCount;
    const isIndeterminate = numSelected > 0 && numSelected < rowCount;

    const renderFilterInput = (column) => {
        if (column.id === 'requiredDate') {
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                        slotProps={{
                            textField: {
                                size: 'small',
                                placeholder: 'Başlangıç',
                                fullWidth: true
                            }
                        }}
                        value={dateFilters[column.id]?.start || null}
                        onChange={(newValue) => onDateFilterChange(column.id, 'start', newValue)}
                        format="DD.MM.YYYY"
                    />
                    <DatePicker
                        slotProps={{
                            textField: {
                                size: 'small',
                                placeholder: 'Bitiş',
                                fullWidth: true
                            }
                        }}
                        value={dateFilters[column.id]?.end || null}
                        onChange={(newValue) => onDateFilterChange(column.id, 'end', newValue)}
                        format="DD.MM.YYYY"
                    />
                </Box>
            );
        }

        return (
            <TextField
                size="small"
                placeholder="Ara..."
                value={searchValues[column.id] || ''}
                onChange={(e) => onSearchChange(column.id, e.target.value)}
                InputProps={{
                    startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
                }}
                fullWidth
            />
        );
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={(e) => onSelectAllClick(e.target.checked)}
                        inputProps={{ 'aria-label': 'Tümünü seç' }}
                    />
                </TableCell>
                {columns.map((column) => (
                    <TableCell key={column.id}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 1
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                height: '32px'
                            }}>
                                {column.label}
                                {column.filterable && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleFilterClick(e, column.id)}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </IconButton>
                                )}
                            </Box>
                            {renderFilterInput(column)}
                        </Box>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default TableHeader; 