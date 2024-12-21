import React, { useState, useEffect } from 'react';
import {
    Table,
    TableContainer,
    Paper,
    Box,
    Typography,
} from '@mui/material';
import TableHeader from './TableHeader.jsx';
import TableBodyComponent from './TableBodyComponent.jsx';
import PaginationComponent from './PaginationComponent.jsx';
import ExportButton from './ExportButton.jsx';
import ActiveFilters from './ActiveFilters';
import ColumnChooser from './ColumnChooser';
import FilterPopover from './FilterPopover';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/tr'; // Türkçe tarih formatı için

// Plugin'leri dayjs'ye ekleyelim
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const OrderGrid = () => {
    const columns = [
        { id: 'orderId', label: 'Sipariş No' },
        { id: 'customerId', label: 'Müşteri ID' },
        { id: 'customerName', label: 'Müşteri Adı' },
        { id: 'employeeId', label: 'Personel ID' },
        { id: 'employeeName', label: 'Personel Adı' },
        { id: 'orderDate', label: 'Sipariş Tarihi' },
        { id: 'requiredDate', label: 'Talep Tarihi' },
        { id: 'shippedDate', label: 'Sevk Tarihi' },
        { id: 'shipName', label: 'Sevk Adı' },
        { id: 'shipAddress', label: 'Sevk Adresi' },
        { id: 'shipCity', label: 'Sevk Şehri', filterable: true },
        { id: 'shipRegion', label: 'Sevk Bölgesi' },
        { id: 'shipPostalCode', label: 'Posta Kodu' },
        { id: 'shipCountry', label: 'Sevk Ülkesi', filterable: true }
    ];

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);

    const [selectedValues, setSelectedValues] = useState({
        shipCity: [],
        shipCountry: [],
    });

    const [uniqueValues, setUniqueValues] = useState({
        shipCity: [],
        shipCountry: [],
    });

    const [selectedRows, setSelectedRows] = useState([]);

    const [searchValues, setSearchValues] = useState(
        Object.fromEntries(columns.map(col => [col.id, '']))
    );

    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('orderGridVisibleColumns');
        return saved ? JSON.parse(saved) : columns.map(col => col.id);
    });

    const [dateFilters, setDateFilters] = useState({
        requiredDate: {
            start: null,
            end: null
        }
    });

    useEffect(() => {
        localStorage.setItem('orderGridVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('https://localhost:7189/api/Customers/GetOrders');
                const data = await response.json();
                
                // Ham tarihleri saklayalım, formatlamayı görüntülemede yapalım
                const formattedData = data.map(order => ({
                    ...order,
                    // Orijinal tarihleri dayjs objesi olarak saklayalım
                    orderDate: order.orderDate,
                    requiredDate: order.requiredDate,
                    shippedDate: order.shippedDate
                }));

                setOrders(formattedData);
                setFilteredOrders(formattedData);

                setUniqueValues({
                    shipCity: [...new Set(data.map(order => order.shipCity))].filter(Boolean),
                    shipCountry: [...new Set(data.map(order => order.shipCountry))].filter(Boolean),
                });
            } catch (error) {
                console.error('Siparişler alınırken hata oluştu:', error);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        const filterData = () => {
            const filtered = orders.filter(order => {
                const cityFilter = selectedValues.shipCity.length === 0 ||
                    selectedValues.shipCity.includes(order.shipCity);

                const countryFilter = selectedValues.shipCountry.length === 0 ||
                    selectedValues.shipCountry.includes(order.shipCountry);

                const searchFilters = Object.keys(searchValues).every(key => {
                    if (!searchValues[key]) return true;
                    const orderValue = order[key]?.toString().toLowerCase() || '';
                    return orderValue.includes(searchValues[key].toLowerCase());
                });

                // Tarih filtresini düzenleyelim
                const dateFilter = Object.entries(dateFilters).every(([field, range]) => {
                    if (!range.start && !range.end) return true;
                    
                    const orderDate = dayjs(order[field]);
                    if (!orderDate.isValid()) return true;

                    const startDate = range.start ? dayjs(range.start).startOf('day') : null;
                    const endDate = range.end ? dayjs(range.end).endOf('day') : null;

                    const startOk = !startDate || orderDate.isSameOrAfter(startDate);
                    const endOk = !endDate || orderDate.isSameOrBefore(endDate);

                    return startOk && endOk;
                });

                return cityFilter && countryFilter && searchFilters && dateFilter;
            });

            setFilteredOrders(filtered);
            setPage(0);
        };

        filterData();
    }, [selectedValues, orders, searchValues, dateFilters]);

    const handleExportExcel = () => {
        const csvContent = [
            columns.map(col => col.label),
            ...filteredOrders.map(order => 
                columns.map(col => order[col.id])
            )
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Sipariş_Listesi.csv');
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
            const newSelecteds = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n) => n.orderId);
            setSelectedRows(newSelecteds);
            return;
        }
        setSelectedRows([]);
    };

    const handleRowClick = (orderId) => {
        const selectedIndex = selectedRows.indexOf(orderId);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedRows, orderId);
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

    const isSelected = (orderId) => selectedRows.indexOf(orderId) !== -1;

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
            if (Array.isArray(columnId)) {
                setVisibleColumns(columnId);
            } else {
                setVisibleColumns([columnId]);
            }
            return;
        }

        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                if (prev.length === 1) return prev;
                return prev.filter(id => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const handleCellEdit = async (orderId, columnId, newValue) => {
        try {
            const response = await fetch(`https://localhost:7189/api/Orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [columnId]: newValue
                })
            });

            if (!response.ok) {
                throw new Error('Güncelleme başarısız oldu');
            }

            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderId === orderId
                        ? { ...order, [columnId]: newValue }
                        : order
                )
            );

            return true;
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            return false;
        }
    };

    const handleDateFilterChange = (field, type, value) => {
        setDateFilters(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [type]: value
            }
        }));
    };

    const filteredColumns = columns.filter(col => 
        visibleColumns.includes(col.id)
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <div className="w-full p-4">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Sipariş Listesi
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
                                rowCount={filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length}
                                onSelectAllClick={handleSelectAllClick}
                                searchValues={searchValues}
                                onSearchChange={handleSearchChange}
                                dateFilters={dateFilters}
                                onDateFilterChange={handleDateFilterChange}
                            />
                            <TableBodyComponent
                                columns={filteredColumns}
                                data={filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => ({
                                    ...order,
                                    // Görüntüleme için tarihleri formatlayalım
                                    orderDate: dayjs(order.orderDate).format('DD.MM.YYYY'),
                                    requiredDate: dayjs(order.requiredDate).format('DD.MM.YYYY'),
                                    shippedDate: order.shippedDate ? dayjs(order.shippedDate).format('DD.MM.YYYY') : null
                                }))}
                                selectedRows={selectedRows}
                                onRowClick={handleRowClick}
                                isSelected={isSelected}
                                onCellEdit={handleCellEdit}
                            />
                        </Table>
                    </TableContainer>
                    <PaginationComponent
                        rowsPerPageOptions={[5, 10, 25]}
                        count={filteredOrders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                    
                    <ActiveFilters
                        selectedValues={{
                            'Sevk Şehri': selectedValues.shipCity,
                            'Sevk Ülkesi': selectedValues.shipCountry
                        }}
                        searchValues={Object.fromEntries(
                            columns.map(col => [
                                col.label,
                                searchValues[col.id]
                            ]).filter(([_, value]) => value)
                        )}
                        onRemoveFilter={(key, value) => {
                            const mappedKey = key === 'Sevk Şehri' ? 'shipCity' : 'shipCountry';
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
        </LocalizationProvider>
    );
};

export default OrderGrid; 