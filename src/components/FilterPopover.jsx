import React, { useState, useEffect } from 'react';
import {
    Popover,
    TextField,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Button,
    IconButton
} from '@mui/material';
import { Search, ChevronDown } from 'lucide-react';

const FilterPopover = ({
    options,
    selectedValues,
    onSelectionChange,
    anchorEl,
    onClose,
    title
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelected, setLocalSelected] = useState(selectedValues);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredOptions.length > 0 && localSelected.length === filteredOptions.length;
    const isIndeterminate = localSelected.length > 0 && localSelected.length < filteredOptions.length;

    const handleToggle = (value) => {
        const currentIndex = localSelected.indexOf(value);
        const newChecked = [...localSelected];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setLocalSelected(newChecked);
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setLocalSelected([]);
        } else {
            const allOptions = filteredOptions;
            setLocalSelected(allOptions);
        }
    };

    const handleApply = () => {
        onSelectionChange(localSelected);
        onClose();
    };

    // Eğer arama sonucu tüm seçenekler seçilmişse, "Tümünü Seç" checkbox'ı da seçilmiş sayılır
    useEffect(() => {
        if (localSelected.length > filteredOptions.length) {
            setLocalSelected(filteredOptions);
        }
    }, [filteredOptions, localSelected.length]);

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            PaperProps={{
                style: {
                    width: 300,
                    maxHeight: 500,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder=""
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />,
                        sx: { height: '55px' }
                    }}
                    sx={{ mb: 1 }}
                />
                <List sx={{ maxHeight: 250, overflow: 'auto' }}>
                    <ListItem
                        dense
                        sx={{ cursor: 'pointer' }}
                        onClick={handleSelectAll}
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                indeterminate={isIndeterminate}
                                checked={isAllSelected}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText primary="Tümünü Seç" />
                    </ListItem>
                    {filteredOptions.map((option) => (
                        <ListItem
                            key={option}
                            dense
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleToggle(option)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={localSelected.indexOf(option) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText primary={option} />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    <Button onClick={onClose} sx={{ mr: 1 }}>İptal</Button>
                    <Button variant="contained" onClick={handleApply}>Uygula</Button>
                </Box>
            </Box>
        </Popover>
    );
};

export default FilterPopover; 