import React from 'react';
import {
  Box,
  useMediaQuery,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { DataTable } from 'components';
import styles from 'styles/components/CustomTable.module.scss';

export interface CustomTableProps<T> {
  emptyMessage?: string;
  showPagination?: boolean;
  rowsPerPage?: number;
  headCells: any;
  data: any;
  defaultOrderBy?: T;
  defaultOrder?: 'asc' | 'desc';
  mobileHTML: (item: any, index: number) => React.ReactNode;
  desktopHTML: (
    item: any,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => any;
}

const CustomTable: React.FC<CustomTableProps<any>> = ({
  rowsPerPage = 5,
  showPagination = true,
  emptyMessage,
  headCells,
  data,
  defaultOrderBy,
  defaultOrder,
  mobileHTML,
  desktopHTML,
}) => {
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className={styles.tableContainer}>
      {mobileWindowSize ? (
        <>
          {data.map((item: any, index: number) => (
            <Box key={index}>{mobileHTML(item, index)}</Box>
          ))}
        </>
      ) : (
        <DataTable
          defaultOrderBy={defaultOrderBy}
          defaultOrder={defaultOrder}
          emptyMesage={emptyMessage}
          showPagination={showPagination}
          headCells={headCells}
          data={data}
          rowPerPage={rowsPerPage}
          sortUpIcon={<ArrowUpward />}
          sortDownIcon={<ArrowDownward />}
          showEmptyRows={false}
          renderRow={(item, index, page, rowsPerPage) => {
            return (
              <TableRow key={index}>
                {desktopHTML(item, index, page, rowsPerPage).map(
                  (cellItem: any, ind: number) => (
                    <TableCell key={ind}>{cellItem.html}</TableCell>
                  ),
                )}
              </TableRow>
            );
          }}
        />
      )}
    </Box>
  );
};

export default CustomTable;
