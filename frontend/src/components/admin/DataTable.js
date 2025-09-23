import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  title = "Data Table",
  searchable = true,
  sortable = true,
  selectable = true,
  actions = [],
  bulkActions = [],
  onRowClick,
  onRefresh,
  onExport,
  // Pagination props
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  serverSide = false,
  // Search and filter props
  searchValue = "",
  onSearchChange,
  filters = {},
  onFilterChange,
  // Additional props
  dense = false,
  stickyHeader = false,
  maxHeight = 600
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionRowId, setActionRowId] = useState(null);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Handle pagination for client-side vs server-side
  const displayData = useMemo(() => {
    if (serverSide) {
      // For server-side pagination, use data as-is
      return data;
    }
    
    // For client-side pagination, handle search, sort, and pagination locally
    let filteredData = [...data];
    
    // Apply search filter
    if (localSearchValue && searchable) {
      filteredData = filteredData.filter(row =>
        columns.some(column => {
          const value = row[column.field];
          return value && value.toString().toLowerCase().includes(localSearchValue.toLowerCase());
        })
      );
    }
    
    // Apply sorting
    if (orderBy && sortable) {
      filteredData.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply pagination
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [data, localSearchValue, orderBy, order, page, rowsPerPage, serverSide, searchable, sortable, columns]);

  // Calculate total count for client-side pagination
  const effectiveTotalCount = serverSide ? totalCount : data.length;

  // Handle search change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setLocalSearchValue(value);
    
    if (serverSide && onSearchChange) {
      // Debounce search for server-side
      const timeoutId = setTimeout(() => {
        onSearchChange(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    } else {
      // For client-side, this would be handled by local state
      // but we're using props, so we still call the handler if provided
      if (onPageChange) onPageChange(newPage);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      if (onRowsPerPageChange) onRowsPerPageChange(newRowsPerPage);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = displayData.map((row) => row.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!selectable) return;
    
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
      if (onPageChange) {
        onPageChange(0);
      }
    }
  };

  const handleActionClick = (event, rowId) => {
    setActionAnchorEl(event.currentTarget);
    setActionRowId(rowId);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActionRowId(null);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const renderCellContent = (row, column) => {
    const value = row[column.field];

    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'avatar':
        return (
          <Avatar
            src={value}
            alt={row.name || 'Avatar'}
            sx={{ width: 32, height: 32 }}
          >
            {(row.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
        );
      case 'chip':
        return (
          <Chip
            label={value}
            size="small"
            color={column.chipColor?.(value) || 'default'}
            variant={column.chipVariant || 'filled'}
          />
        );
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value || 0);
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'boolean':
        return (
          <Chip
            label={value ? 'Yes' : 'No'}
            size="small"
            color={value ? 'success' : 'default'}
          />
        );
      default:
        return value;
    }
  };

  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: rowsPerPage }).map((_, index) => (
        <TableRow key={index}>
          {selectable && (
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={18} height={18} />
            </TableCell>
          )}
          {columns.map((column) => (
            <TableCell key={column.field}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
          {actions && (
            <TableCell>
              <Skeleton variant="circular" width={24} height={24} />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        boxShadow: theme.shadows[1],
        borderRadius: 2,
      }}
    >
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {title}
          </Typography>
        )}

        {selected.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {bulkActions.map((action, index) => (
              <Tooltip key={`bulk-action-${index}`} title={action.label}>
                <IconButton
                  onClick={() => action.onClick(selected)}
                  color={action.color || 'default'}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {searchable && (
              <TextField
                size="small"
                placeholder="Search..."
                value={localSearchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            <Tooltip title="Filter">
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            {onExport && (
              <Tooltip title="Export">
                <IconButton onClick={onExport}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer 
        sx={{ 
          maxHeight: maxHeight,
          '& .MuiTableCell-root': {
            borderColor: theme.palette.divider,
          }
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          size={dense ? 'small' : 'medium'}
          aria-label={title}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < displayData.length
                    }
                    checked={
                      displayData.length > 0 && selected.length === displayData.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  sortDirection={orderBy === column.field ? order : false}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[50],
                    ...(column.width && { width: column.width }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      onClick={() => handleRequestSort(column.field)}
                    >
                      {column.headerName || column.field}
                    </TableSortLabel>
                  ) : (
                    column.headerName || column.field
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[50],
                    width: 80,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => {
                      if (onRowClick && !selectable) {
                        onRowClick(row);
                      } else if (selectable) {
                        handleClick(event, row.id);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{
                      cursor: onRowClick || selectable ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                        padding={column.disablePadding ? 'none' : 'normal'}
                      >
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(e, row.id);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={effectiveTotalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 2,
            paddingRight: 2,
          },
        }}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={`action-${index}`}
            onClick={() => {
              const row = displayData.find(r => r.id === actionRowId);
              action.onClick(row);
              handleActionClose();
            }}
            sx={action.color === 'error' ? { color: theme.palette.error.main } : {}}
          >
            {action.icon && (
              <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                {action.icon}
              </Box>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          <Typography variant="body2">Filter options coming soon...</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default DataTable;