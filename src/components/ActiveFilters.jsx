import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { X } from 'lucide-react';

const ActiveFilters = ({ selectedValues, onRemoveFilter, searchValues, onRemoveSearch }) => {
    const hasActiveFilters = Object.values(selectedValues).some(arr => arr.length > 0) ||
        Object.values(searchValues).some(value => value !== '');

    if (!hasActiveFilters) return null;

    return (
        <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            p: 2, 
            borderTop: '1px solid #e0e0e0',
            alignItems: 'center'
        }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Aktif Filtreler:
            </Typography>
            
            {/* Filtre değerleri için chip'ler */}
            {Object.entries(selectedValues).map(([key, values]) =>
                values.map(value => (
                    <Chip
                        key={`${key}-${value}`}
                        label={`${key}: ${value}`}
                        onDelete={() => onRemoveFilter(key, value)}
                        size="small"
                    />
                ))
            )}

            {/* Arama değerleri için chip'ler */}
            {Object.entries(searchValues).map(([key, value]) =>
                value ? (
                    <Chip
                        key={`search-${key}`}
                        label={`${key} içinde: ${value}`}
                        onDelete={() => onRemoveSearch(key)}
                        size="small"
                    />
                ) : null
            )}
        </Box>
    );
};

export default ActiveFilters; 