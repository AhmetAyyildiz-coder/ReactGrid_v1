import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { X } from 'lucide-react';

const GroupingControl = ({ columns, groupBy, onGroupByChange, onClearGrouping }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Gruplama</InputLabel>
                <Select
                    value={groupBy || ''}
                    label="Gruplama"
                    onChange={(e) => onGroupByChange(e.target.value)}
                >
                    <MenuItem value="">
                        <em>Gruplanmamış</em>
                    </MenuItem>
                    {columns.map((column) => (
                        <MenuItem key={column.id} value={column.id}>
                            {column.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {groupBy && (
                <IconButton 
                    size="small" 
                    onClick={onClearGrouping}
                    title="Gruplamayı Kaldır"
                >
                    <X className="w-4 h-4" />
                </IconButton>
            )}
        </Box>
    );
};

export default GroupingControl; 