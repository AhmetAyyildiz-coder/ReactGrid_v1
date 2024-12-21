import React, { useState, useEffect } from 'react';
import {
    Table,
    TableContainer,
    Paper,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import FilterPopover from './FilterPopover.jsx';
import TableHeader from './TableHeader.jsx';
import TableBodyComponent from './TableBodyComponent.jsx';
import PaginationComponent from './PaginationComponent.jsx';
import ExportButton from './ExportButton.jsx';
import ActiveFilters from './ActiveFilters';
import ColumnChooser from './ColumnChooser';

const CustomerGrid = () => {
    const columns = [
        { id: 'customerId', label: 'Müşteri ID' },
        { id: 'companyName', label: 'Şirket Adı' },
        { id: 'contactName', label: 'İletişim Adı' },
        { id: 'contactTitle', label: 'İletişim Ünvanı' },
        { id: 'address', label: 'Adres' },
        { id: 'city', label: 'Şehir', filterable: true },
        { id: 'country', label: 'Ülke', filterable: true },
        { id: 'phone', label: 'Telefon' }
    ];

    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);

    const [selectedValues, setSelectedValues] = useState({
        city: [],
        country: [],
    });

    const [uniqueValues, setUniqueValues] = useState({
        city: [],
        country: [],
    });

    const [selectedRows, setSelectedRows] = useState([]);

    const [searchValues, setSearchValues] = useState({
        customerId: '',
        companyName: '',
        contactName: '',
        contactTitle: '',
        address: '',
        city: '',
        country: '',
        phone: ''
    });

    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('visibleColumns');
        return saved ? JSON.parse(saved) : columns.map(col => col.id);
    });

    useEffect(() => {
        localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('https://localhost:7189/api/Customers');
                const data = await response.json();
                setCustomers(data);
                setFilteredCustomers(data);

                setUniqueValues({
                    city: [...new Set(data.map(customer => customer.city))].filter(Boolean),
                    country: [...new Set(data.map(customer => customer.country))].filter(Boolean),
                });
            } catch (error) {
                console.error('Müşteriler alınırken hata oluştu:', error);
            }
        };

        fetchCustomers();
    }, []);

    useEffect(() => {
        const filterData = () => {
            const filtered = customers.filter(customer => {
                const cityFilter = selectedValues.city.length === 0 ||
                    selectedValues.city.includes(customer.city);

                const countryFilter = selectedValues.country.length === 0 ||
                    selectedValues.country.includes(customer.country);

                const searchFilters = Object.keys(searchValues).every(key => {
                    if (!searchValues[key]) return true;
                    const customerValue = customer[key]?.toString().toLowerCase() || '';
                    return customerValue.includes(searchValues[key].toLowerCase());
                });

                return cityFilter && countryFilter && searchFilters;
            });

            setFilteredCustomers(filtered);
            setPage(0);
        };

        filterData();
    }, [selectedValues, customers, searchValues]);

    const handleExportExcel = () => {
        const csvContent = [
            ['Müşteri ID', 'Şirket Adı', 'İletişim Adı', 'İletişim Ünvanı', 'Adres', 'Şehir', 'Ülke', 'Telefon'],
            ...filteredCustomers.map(customer => [
                customer.customerId,
                customer.companyName,
                customer.contactName,
                customer.contactTitle,
                customer.address,
                customer.city,
                customer.country,
                customer.phone
            ])
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Müşteri_Listesi.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFilterClick = (event, filterType) => {
        setFilterAnchorEl(event.currentTarget);
        setActiveFilter(filterType);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
        setActiveFilter(null);
    };

    const handleSelectionChange = (newSelected) => {
        setSelectedValues(prev => ({
            ...prev,
            [activeFilter]: newSelected
        }));
    };

    const handleSelectAllClick = (isChecked) => {
        if (isChecked) {
            const newSelecteds = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n) => n.customerId);
            setSelectedRows(newSelecteds);
            return;
        }
        setSelectedRows([]);
    };

    const handleRowClick = (customerId) => {
        const selectedIndex = selectedRows.indexOf(customerId);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedRows, customerId);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedRows.slice(1));
        } else if (selectedIndex === selectedRows.length - 1) {
            newSelected = newSelected.concat(selectedRows.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedRows.slice(0, selectedIndex),
                selectedRows.slice(selectedIndex + 1)
            );
        }

        setSelectedRows(newSelected);
    };

    const isSelected = (customerId) => selectedRows.indexOf(customerId) !== -1;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (columnId, value) => {
        setSearchValues(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const handleRemoveFilter = (filterType, value) => {
        setSelectedValues(prev => ({
            ...prev,
            [filterType]: prev[filterType].filter(item => item !== value)
        }));
    };

    const handleRemoveSearch = (searchKey) => {
        setSearchValues(prev => ({
            ...prev,
            [searchKey]: ''
        }));
    };

    const handleColumnToggle = (columnId, isSelectAll = false) => {
        if (isSelectAll) {
            // Tümünü seç/kaldır işlemi
            if (Array.isArray(columnId)) {
                setVisibleColumns(columnId);
            } else {
                setVisibleColumns([columnId]); // Sadece bir kolon bırak
            }
            return;
        }

        // Tekli kolon seçimi
        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                if (prev.length === 1) return prev;
                return prev.filter(id => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const filteredColumns = columns.filter(col => 
        visibleColumns.includes(col.id)
    );

    return (
        <div className="w-full p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Müşteri Listesi
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedRows.length > 0 && (
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                            {selectedRows.length} kayıt seçildi
                        </Typography>
                    )}
                    <ExportButton onExport={handleExportExcel} />
                    <ColumnChooser
                        columns={columns}
                        visibleColumns={visibleColumns}
                        onColumnToggle={handleColumnToggle}
                    />
                </Box>
            </Box>
            <Paper className="w-full mb-4">
                <TableContainer className="max-h-screen">
                    <Table stickyHeader>
                        <TableHeader
                            columns={filteredColumns}
                            selectedValues={selectedValues}
                            handleFilterClick={handleFilterClick}
                            numSelected={selectedRows.length}
                            rowCount={filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                            onSelectAllClick={handleSelectAllClick}
                            searchValues={searchValues}
                            onSearchChange={handleSearchChange}
                        />
                        <TableBodyComponent
                            columns={filteredColumns}
                            data={filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                            selectedRows={selectedRows}
                            onRowClick={handleRowClick}
                            isSelected={isSelected}
                        />
                    </Table>
                </TableContainer>
                <PaginationComponent
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredCustomers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
                
                <ActiveFilters
                    selectedValues={{
                        'Şehir': selectedValues.city,
                        'Ülke': selectedValues.country
                    }}
                    searchValues={Object.fromEntries(
                        columns.map(col => [
                            col.label,
                            searchValues[col.id]
                        ]).filter(([_, value]) => value)
                    )}
                    onRemoveFilter={(key, value) => {
                        const mappedKey = key === 'Şehir' ? 'city' : 'country';
                        handleRemoveFilter(mappedKey, value);
                    }}
                    onRemoveSearch={(key) => {
                        const column = columns.find(col => col.label === key);
                        if (column) {
                            handleRemoveSearch(column.id);
                        }
                    }}
                />
            </Paper>

            {activeFilter && (
                <FilterPopover
                    options={uniqueValues[activeFilter]}
                    selectedValues={selectedValues[activeFilter]}
                    onSelectionChange={handleSelectionChange}
                    anchorEl={filterAnchorEl}
                    onClose={handleFilterClose}
                    title={columns.find(col => col.id === activeFilter)?.label}
                />
            )}
        </div>
    );
};

export default CustomerGrid;