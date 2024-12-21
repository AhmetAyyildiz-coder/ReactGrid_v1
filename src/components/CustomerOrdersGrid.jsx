import React, { useState, useEffect } from 'react';
import {
    Table,
    TableContainer,
    Paper,
    Box,
    Typography,
    Collapse,
    IconButton
} from '@mui/material';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TableHeader from './TableHeader.jsx';
import TableBodyComponent from './TableBodyComponent.jsx';
import PaginationComponent from './PaginationComponent.jsx';
import ExportButton from './ExportButton.jsx';
import ActiveFilters from './ActiveFilters';
import ColumnChooser from './ColumnChooser';
import FilterPopover from './FilterPopover';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import * as XLSX from 'xlsx';

const CustomerOrdersGrid = () => {
    const customerColumns = [
        { id: 'customerId', label: 'Müşteri ID' },
        { id: 'companyName', label: 'Şirket Adı' },
        { id: 'contactName', label: 'İletişim Adı' },
        { id: 'contactTitle', label: 'İletişim Ünvanı' },
        { id: 'address', label: 'Adres' },
        { id: 'city', label: 'Şehir', filterable: true }
    ];

    const orderColumns = [
        { id: 'orderId', label: 'Sipariş No' },
        { id: 'employeeId', label: 'Personel ID' },
        { id: 'employeeName', label: 'Personel Adı' },
        { id: 'orderDate', label: 'Sipariş Tarihi', type: 'date' },
        { id: 'requiredDate', label: 'Talep Tarihi', type: 'date' },
        { id: 'shippedDate', label: 'Sevk Tarihi', type: 'date' },
        { id: 'shipAddress', label: 'Sevk Adresi' },
        { id: 'shipCity', label: 'Sevk Şehri' },
        { id: 'shipCountry', label: 'Sevk Ülkesi' },
        { id: 'sumQuantity', label: 'Toplam Miktar', type: 'number' }
    ];

    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [customerOrders, setCustomerOrders] = useState({});
    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);

    const [selectedValues, setSelectedValues] = useState({
        city: []
    });

    const [uniqueValues, setUniqueValues] = useState({
        city: []
    });

    const [searchValues, setSearchValues] = useState(
        Object.fromEntries(customerColumns.map(col => [col.id, '']))
    );

    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('customerOrdersVisibleColumns');
        return saved ? JSON.parse(saved) : customerColumns.map(col => col.id);
    });

    const [selectedOrderRows, setSelectedOrderRows] = useState({});

    const [dateFilters, setDateFilters] = useState(
        orderColumns
            .filter(col => col.type === 'date')
            .reduce((acc, col) => ({
                ...acc,
                [col.id]: { start: null, end: null }
            }), {})
    );

    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [detailSortConfigs, setDetailSortConfigs] = useState({});

    const [detailSearchValues, setDetailSearchValues] = useState({});

    const [detailDateFilters, setDetailDateFilters] = useState({});

    const handleDateFilterChange = (columnId, type, value) => {
        setDateFilters(prev => ({
            ...prev,
            [columnId]: {
                ...prev[columnId],
                [type]: value
            }
        }));
    };

    const handleSort = (columnId) => {
        let direction = 'asc';
        if (sortConfig.key === columnId && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnId, direction });
    };

    useEffect(() => {
        localStorage.setItem('customerOrdersVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('https://localhost:7189/api/Customers/GetCustomers');
            const data = await response.json();
            setCustomers(data);
            setFilteredCustomers(data);

            setUniqueValues({
                city: [...new Set(data.map(customer => customer.city))].filter(Boolean)
            });
        } catch (error) {
            console.error('Müşteriler alınırken hata oluştu:', error);
        }
    };

    const fetchCustomerOrders = async (customerId) => {
        if (customerOrders[customerId]) return;

        setLoading(true);
        try {
            const response = await fetch(`https://localhost:7189/api/Customers/GetOrdersByCustomer?customerId=${customerId}`);
            const data = await response.json();
            
            setCustomerOrders(prev => ({
                ...prev,
                [customerId]: data.map(order => {
                    const safeOrder = order || {};
                    return {
                        orderId: safeOrder.orderId || '',
                        customerId: safeOrder.customerId || '',
                        customerName: safeOrder.customerName || '',
                        employeeId: safeOrder.employeeId || '',
                        employeeName: safeOrder.employeeName || '',
                        orderDate: safeOrder.orderDate ? dayjs(safeOrder.orderDate).format('DD.MM.YYYY') : '-',
                        requiredDate: safeOrder.requiredDate ? dayjs(safeOrder.requiredDate).format('DD.MM.YYYY') : '-',
                        shippedDate: safeOrder.shippedDate ? dayjs(safeOrder.shippedDate).format('DD.MM.YYYY') : '-',
                        shipName: safeOrder.shipName || '',
                        shipAddress: safeOrder.shipAddress || '',
                        shipCity: safeOrder.shipCity || '',
                        shipRegion: safeOrder.shipRegion || '',
                        shipPostalCode: safeOrder.shipPostalCode || '',
                        shipCountry: safeOrder.shipCountry || '',
                        sumQuantity: safeOrder.sumQuantity || 0
                    };
                })
            }));
        } catch (error) {
            console.error('Siparişler alınırken hata oluştu:', error);
            setCustomerOrders(prev => ({
                ...prev,
                [customerId]: []
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleExpandCustomer = async (customerId) => {
        if (expandedCustomer === customerId) {
            setExpandedCustomer(null);
        } else {
            setExpandedCustomer(customerId);
            await fetchCustomerOrders(customerId);
        }
    };

    const handleSearchChange = (columnId, value) => {
        setSearchValues(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    useEffect(() => {
        const filterAndSortData = () => {
            let filtered = customers.filter(customer => {
                const cityFilter = selectedValues.city.length === 0 ||
                    selectedValues.city.includes(customer.city);

                const searchFilters = Object.keys(searchValues).every(key => {
                    if (!searchValues[key]) return true;
                    const customerValue = customer[key]?.toString().toLowerCase() || '';
                    return customerValue.includes(searchValues[key].toLowerCase());
                });

                return cityFilter && searchFilters;
            });

            if (sortConfig.key) {
                filtered.sort((a, b) => {
                    const aValue = a[sortConfig.key] || '';
                    const bValue = b[sortConfig.key] || '';
                    
                    if (aValue < bValue) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
            }

            setFilteredCustomers(filtered);
            setPage(0);
        };

        filterAndSortData();
    }, [selectedValues, customers, searchValues, sortConfig]);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = filteredCustomers.map(customer => customer.customerId);
            setSelectedCustomers(newSelected);
            return;
        }
        setSelectedCustomers([]);
    };

    const handleCustomerClick = (event, customerId) => {
        const selectedIndex = selectedCustomers.indexOf(customerId);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedCustomers, customerId);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedCustomers.slice(1));
        } else if (selectedIndex === selectedCustomers.length - 1) {
            newSelected = newSelected.concat(selectedCustomers.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedCustomers.slice(0, selectedIndex),
                selectedCustomers.slice(selectedIndex + 1),
            );
        }

        setSelectedCustomers(newSelected);
    };

    const isCustomerSelected = (customerId) => selectedCustomers.indexOf(customerId) !== -1;

    const renderCustomerRow = (customer) => {
        const isExpanded = expandedCustomer === customer.customerId;
        const orders = customerOrders[customer.customerId] || [];
        
        const safeCustomer = {
            customerId: customer?.customerId || '',
            companyName: customer?.companyName || '',
            contactName: customer?.contactName || '',
            contactTitle: customer?.contactTitle || '',
            address: customer?.address || '',
            city: customer?.city || ''
        };

        const customerSelectedRows = selectedOrderRows[customer.customerId] || [];
        const detailSortConfig = detailSortConfigs[customer.customerId] || { key: null, direction: null };

        const handleDetailSort = (columnId) => {
            let direction = 'asc';
            if (detailSortConfig.key === columnId && detailSortConfig.direction === 'asc') {
                direction = 'desc';
            }
            setDetailSortConfigs(prev => ({
                ...prev,
                [customer.customerId]: { key: columnId, direction }
            }));
        };

        const customerSearchValues = detailSearchValues[customer.customerId] || {};

        const handleDetailSearchChange = (columnId, value) => {
            setDetailSearchValues(prev => ({
                ...prev,
                [customer.customerId]: {
                    ...prev[customer.customerId],
                    [columnId]: value
                }
            }));
        };

        const customerDateFilters = detailDateFilters[customer.customerId] || 
            orderColumns
                .filter(col => col.type === 'date')
                .reduce((acc, col) => ({
                    ...acc,
                    [col.id]: { start: null, end: null }
                }), {});

        const handleDetailDateFilterChange = (columnId, type, value) => {
            setDetailDateFilters(prev => ({
                ...prev,
                [customer.customerId]: {
                    ...prev[customer.customerId],
                    [columnId]: {
                        ...(prev[customer.customerId]?.[columnId] || {}),
                        [type]: value
                    }
                }
            }));
        };

        const filteredOrders = orders.filter(order => {
            const searchFilter = orderColumns.every(column => {
                const searchValue = customerSearchValues[column.id]?.toLowerCase() || '';
                if (!searchValue) return true;
                
                const orderValue = order[column.id]?.toString().toLowerCase() || '';
                return orderValue.includes(searchValue);
            });

            const dateFilter = orderColumns
                .filter(col => col.type === 'date')
                .every(column => {
                    const filter = customerDateFilters[column.id];
                    if (!filter?.start && !filter?.end) return true;

                    const orderDate = order[column.id] ? dayjs(order[column.id], 'DD.MM.YYYY') : null;
                    if (!orderDate) return false;

                    const startDate = filter.start ? dayjs(filter.start).startOf('day') : null;
                    const endDate = filter.end ? dayjs(filter.end).endOf('day') : null;

                    if (startDate && endDate) {
                        return orderDate.isBetween(startDate, endDate, 'day', '[]');
                    } else if (startDate) {
                        return orderDate.isSameOrAfter(startDate, 'day');
                    } else if (endDate) {
                        return orderDate.isSameOrBefore(endDate, 'day');
                    }

                    return true;
                });

            return searchFilter && dateFilter;
        });

        const sortedOrders = [...filteredOrders];
        if (detailSortConfig.key) {
            sortedOrders.sort((a, b) => {
                const aValue = a[detailSortConfig.key] || '';
                const bValue = b[detailSortConfig.key] || '';
                
                if (aValue < bValue) {
                    return detailSortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return detailSortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        const isSelected = (orderId) => customerSelectedRows.indexOf(orderId) !== -1;

        const handleOrderRowClick = (event, orderId) => {
            const selectedIndex = customerSelectedRows.indexOf(orderId);
            let newSelected = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(customerSelectedRows, orderId);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(customerSelectedRows.slice(1));
            } else if (selectedIndex === customerSelectedRows.length - 1) {
                newSelected = newSelected.concat(customerSelectedRows.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    customerSelectedRows.slice(0, selectedIndex),
                    customerSelectedRows.slice(selectedIndex + 1),
                );
            }

            setSelectedOrderRows(prev => ({
                ...prev,
                [customer.customerId]: newSelected
            }));
        };

        return (
            <React.Fragment key={safeCustomer.customerId}>
                <tr>
                    <td colSpan={visibleColumns.length + 1}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            p: 2,
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}>
                            <IconButton
                                size="small"
                                onClick={() => handleExpandCustomer(safeCustomer.customerId)}
                            >
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </IconButton>
                            {customerColumns.filter(col => visibleColumns.includes(col.id)).map(column => (
                                <Box key={column.id} sx={{ flex: 1, px: 1 }}>
                                    {safeCustomer[column.id]}
                                </Box>
                            ))}
                        </Box>
                    </td>
                </tr>
                <tr>
                    <td colSpan={visibleColumns.length + 1}>
                        <Collapse in={isExpanded}>
                            <Box sx={{ pl: 6, pr: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                                {loading ? (
                                    <Typography sx={{ p: 2 }}>Yükleniyor...</Typography>
                                ) : orders.length > 0 ? (
                                    <>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHeader
                                                    columns={orderColumns}
                                                    searchValues={customerSearchValues}
                                                    onSearchChange={handleDetailSearchChange}
                                                    sortConfig={detailSortConfig}
                                                    onSort={handleDetailSort}
                                                    dateFilters={customerDateFilters}
                                                    onDateFilterChange={handleDetailDateFilterChange}
                                                    numSelected={customerSelectedRows.length}
                                                    rowCount={sortedOrders.length}
                                                    onSelectAllClick={(event) => {
                                                        if (event.target.checked) {
                                                            setSelectedOrderRows(prev => ({
                                                                ...prev,
                                                                [customer.customerId]: sortedOrders.map(order => order.orderId)
                                                            }));
                                                        } else {
                                                            setSelectedOrderRows(prev => ({
                                                                ...prev,
                                                                [customer.customerId]: []
                                                            }));
                                                        }
                                                    }}
                                                />
                                                <TableBodyComponent
                                                    columns={orderColumns}
                                                    data={sortedOrders}
                                                    selectedRows={customerSelectedRows}
                                                    onRowClick={handleOrderRowClick}
                                                    isSelected={isSelected}
                                                />
                                            </Table>
                                        </TableContainer>
                                        <Box sx={{ 
                                            mt: 2, 
                                            p: 2, 
                                            bgcolor: 'rgba(0, 0, 0, 0.03)',
                                            borderRadius: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="subtitle2">
                                                Toplam Kayıt: {sortedOrders.length}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 4 }}>
                                                <Typography variant="subtitle2">
                                                    Toplam Miktar: {sortedOrders.reduce((sum, order) => sum + (order.sumQuantity || 0), 0)}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    Ortalama Miktar: {(sortedOrders.reduce((sum, order) => sum + (order.sumQuantity || 0), 0) / sortedOrders.length).toFixed(2)}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    Max Miktar: {Math.max(...sortedOrders.map(order => order.sumQuantity || 0))}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    Min Miktar: {Math.min(...sortedOrders.map(order => order.sumQuantity || 0))}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </>
                                ) : (
                                    <Typography sx={{ p: 2 }}>Sipariş bulunamadı</Typography>
                                )}
                            </Box>
                        </Collapse>
                    </td>
                </tr>
            </React.Fragment>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    px: 2
                }}>
                    <Typography variant="h6" component="h2">
                        Müşteri ve Siparişleri
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ColumnChooser
                            columns={customerColumns}
                            visibleColumns={visibleColumns}
                            onColumnToggle={(columnId, isSelectAll) => {
                                if (isSelectAll) {
                                    setVisibleColumns(columnId);
                                } else {
                                    setVisibleColumns(prev => {
                                        if (prev.includes(columnId)) {
                                            if (prev.length === 1) return prev;
                                            return prev.filter(id => id !== columnId);
                                        }
                                        return [...prev, columnId];
                                    });
                                }
                            }}
                        />
                    </Box>
                </Box>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHeader
                                columns={customerColumns.filter(col => visibleColumns.includes(col.id))}
                                searchValues={searchValues}
                                onSearchChange={handleSearchChange}
                                selectedValues={selectedValues}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                                dateFilters={dateFilters}
                                onDateFilterChange={handleDateFilterChange}
                                numSelected={selectedCustomers.length}
                                rowCount={filteredCustomers.length}
                                onSelectAllClick={handleSelectAllClick}
                            />
                            <tbody>
                                {filteredCustomers
                                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                    .map(renderCustomerRow)}
                            </tbody>
                        </Table>
                    </TableContainer>
                    <PaginationComponent
                        rowsPerPageOptions={[5, 10, 25]}
                        count={filteredCustomers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        handleChangePage={(_, newPage) => setPage(newPage)}
                        handleChangeRowsPerPage={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CustomerOrdersGrid; 