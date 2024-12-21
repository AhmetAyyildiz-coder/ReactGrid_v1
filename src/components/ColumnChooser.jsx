import React from 'react';
import {
    Popover,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Typography,
    Box,
    IconButton,
    Divider
} from '@mui/material';
import { Columns } from 'lucide-react';

const ColumnChooser = ({ columns, visibleColumns, onColumnToggle }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (columnId) => {
        onColumnToggle(columnId);
    };

    const handleSelectAll = () => {
        const allColumnIds = columns.map(col => col.id);
        if (visibleColumns.length === columns.length) {
            // Eğer hepsi seçiliyse, sadece ilk kolonu bırak
            onColumnToggle(allColumnIds[0], true);
        } else {
            // Değilse hepsini seç
            onColumnToggle(allColumnIds, true);
        }
    };

    const isAllSelected = visibleColumns.length === columns.length;

    return (
        <>
            <IconButton 
                onClick={handleClick}
                size="small"
                sx={{ ml: 1 }}
                title="Kolonları Düzenle"
            >
                <Columns className="w-5 h-5" />
            </IconButton>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, width: 250 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Görünür Kolonlar
                    </Typography>
                    <List dense>
                        <ListItem
                            dense
                            button
                            onClick={handleSelectAll}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={isAllSelected}
                                    indeterminate={visibleColumns.length > 1 && visibleColumns.length < columns.length}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText primary="Tümünü Seç" />
                        </ListItem>
                        <Divider />
                        {columns.map((column) => (
                            <ListItem
                                key={column.id}
                                dense
                                button
                                onClick={() => handleToggle(column.id)}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={visibleColumns.includes(column.id)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText primary={column.label} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Popover>
        </>
    );
};

export default ColumnChooser; 