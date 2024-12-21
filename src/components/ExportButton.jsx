import React from 'react';
import { Button } from '@mui/material';
import { Download } from 'lucide-react';

const ExportButton = ({ onExport }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<Download className="w-4 h-4" />}
            onClick={onExport}
        >
            CSV'ye Aktar
        </Button>
    );
};

export default ExportButton; 