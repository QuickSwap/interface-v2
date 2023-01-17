import React, { useState } from 'react';
import { Box } from 'theme/components';
import Loader from 'components/Loader';
import { SortOrder, getComparator, stableSort } from './sort';
import 'components/styles/DataTable.scss';

export interface HeadCell<T> {
  id: string;
  label: React.ReactNode | string;
  numeric: boolean;
  sortDisabled?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit' | undefined;
  element?: React.ReactNode;
  buttonCell?: boolean;
  sortKey: (optionBalance: T) => string | number;
}

export interface DataTableProps<T> {
  headCells: HeadCell<T>[];
  data: T[];
  renderRow: (
    item: T,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => React.ReactNode;
  toolbar?: React.ReactNode;
  caption?: React.ReactNode;
  defaultOrderBy?: T;
  defaultOrder?: 'asc' | 'desc';
  loading?: boolean;
  isSinglelineHeader?: boolean;
  size?: number;
  rowPerPage?: number;
  sortUpIcon?: React.ReactNode;
  sortDownIcon?: React.ReactNode;
  emptyMesage?: string;
  showEmptyRows: boolean;
  showPagination: boolean;
}

const DataTable: React.FC<DataTableProps<any>> = ({
  headCells,
  data,
  renderRow,
  toolbar,
  sortUpIcon,
  sortDownIcon,
  caption,
  defaultOrderBy = headCells[0],
  defaultOrder = 'asc',
  loading = false,
  isSinglelineHeader = false,
  size = 0,
  rowPerPage = 10,
  emptyMesage = 'No results.',
  showEmptyRows = true,
  showPagination,
}) => {
  const [order, setOrder] = useState<SortOrder>(defaultOrder);
  const [orderBy, setOrderBy] = useState<HeadCell<any>>(defaultOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowPerPage);
  const count = size || data.length;

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: HeadCell<any>,
  ) => {
    const isAsc = orderBy.id === property.id && order === 'asc';
    setOrder(isAsc && !property.sortDisabled ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <Box className='datatableWrapper'>
      {toolbar}

      <table
        className='table'
        aria-labelledby='tableTitle'
        aria-label='enhanced table'
      >
        <thead>
          <tr>
            {headCells.map((headCell, index) => (
              <th
                className={headCell.buttonCell ? 'buttonCell' : ''}
                key={`${headCell.id}_${index}`}
                // align={headCell.align}
                // padding='normal'
                // sortDirection={orderBy.id === headCell.id ? order : false}
              >
                {headCell.element}
                {sortUpIcon && sortDownIcon ? (
                  <Box
                    className='flex items-center'
                    style={{
                      whiteSpace: isSinglelineHeader ? 'nowrap' : 'initial',
                    }}
                    onClick={(event: any) => handleRequestSort(event, headCell)}
                  >
                    <Box
                      className={`headCellLabel${
                        orderBy.id === headCell.id
                          ? ' sortRequestedHeadLabel'
                          : ''
                      }`}
                    >
                      {headCell.label}
                    </Box>
                    {!headCell.sortDisabled && (
                      <Box
                        className={`sortIcon${
                          orderBy.id === headCell.id ? ' sortRequestedIcon' : ''
                        }`}
                      >
                        {order === 'asc' && orderBy.id === headCell.id
                          ? sortUpIcon
                          : sortDownIcon}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    style={{
                      whiteSpace: isSinglelineHeader ? 'nowrap' : 'initial',
                    }}
                    // active={orderBy.id === headCell.id}
                    // direction={orderBy.id === headCell.id ? order : 'asc'}
                    onClick={(event: any) => handleRequestSort(event, headCell)}
                  >
                    {headCell.label}
                    {orderBy.id === headCell.id ? (
                      <span className='visuallyHidden'>
                        {order === 'desc'
                          ? 'sorted descending'
                          : 'sorted ascending'}
                      </span>
                    ) : null}
                  </Box>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr style={{ height: 53 * emptyRows }}>
              <td colSpan={headCells.length}>
                <Box className='flex justify-center items-center'>
                  <Loader size='16px' />
                </Box>
              </td>
            </tr>
          )}

          {stableSort(data, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item, index) => renderRow(item, index, page, rowsPerPage))}

          {!loading && data.length < 1 && (
            <tr style={{ height: 53 }}>
              <td colSpan={headCells.length} align='center'>
                {emptyMesage}
              </td>
            </tr>
          )}

          {!loading && emptyRows > 0 && showEmptyRows && (
            <tr
              style={{
                height: 53 * (data.length < 1 ? emptyRows - 1 : emptyRows),
              }}
            >
              <td colSpan={headCells.length} />
            </tr>
          )}
        </tbody>

        {/* Todo: show captions */}
        {caption === false && <span style={{ marginTop: 24 }}>{caption}</span>}
      </table>

      {showPagination && (
        <Box
          // rowsPerPageOptions={[5, 10, 25, 50]}
          className='tablePagination'
          // component='div'
          // count={count}
          // rowsPerPage={rowsPerPage}
          // page={page}
          // onPageChange={handleChangePage}
          // onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default DataTable;
