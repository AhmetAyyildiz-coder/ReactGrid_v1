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

const CustomerGrid = () => {
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

                return cityFilter && countryFilter;
            });

            setFilteredCustomers(filtered);
            setPage(0);
        };

        filterData();
    }, [selectedValues, customers]);

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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="w-full p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Müşteri Listesi
                </Typography>
                <ExportButton onExport={handleExportExcel} />
            </Box>
            <Paper className="w-full mb-4">
                <TableContainer className="max-h-screen">
                    <Table stickyHeader>
                        <TableHeader
                            columns={columns}
                            selectedValues={selectedValues}
                            handleFilterClick={handleFilterClick}
                        />
                        <TableBodyComponent
                            columns={columns}
                            data={filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
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