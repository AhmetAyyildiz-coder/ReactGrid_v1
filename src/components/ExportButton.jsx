import React from 'react';
import { Button } from '@mui/material';
import { FileSpreadsheet } from 'lucide-react';

const ExportButton = ({ onExport, text = "Excel'e Aktar" }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={onExport}
        >
            {text}
        </Button>
    );
};

export default ExportButton; 