import React from 'react';
import { TableHead, TableRow, TableCell, Box, Typography, IconButton } from '@mui/material';
import { ChevronDown } from 'lucide-react';

const TableHeader = ({ columns, selectedValues, handleFilterClick }) => {
    return (
        <TableHead>
            <TableRow>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {column.label}
                            {column.filterable && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleFilterClick(e, column.id)}
                                    sx={{ ml: 1 }}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </IconButton>
                            )}
                        </Box>
                        {selectedValues[column.id]?.length > 0 && (
                            <Typography variant="caption" color="primary">
                                {selectedValues[column.id].length} seçili
                            </Typography>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default TableHeader; 