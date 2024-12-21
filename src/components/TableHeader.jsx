import React from 'react';
import { TableHead, TableRow, TableCell, Box, Typography, IconButton, Checkbox, TextField } from '@mui/material';
import { ChevronDown, Search } from 'lucide-react';

const TableHeader = ({ columns, selectedValues, handleFilterClick, numSelected, rowCount, onSelectAllClick, searchValues, onSearchChange }) => {
    const isAllSelected = rowCount > 0 && numSelected === rowCount;
    const isIndeterminate = numSelected > 0 && numSelected < rowCount;

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
                        </Box>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default TableHeader; 