import React, { ReactElement, useState } from 'react';
import { Box, TablePagination } from '@material-ui/core';

export interface CustomTableProps<T> {
  data: any;
  mobileHTML: (item: any, index: number) => ReactElement;
}

const CustomTableMobile: React.FC<CustomTableProps<any>> = ({
  data,
  mobileHTML,
}) => {
  const [page, setPage] = useState(0);
  const count = data.length;
  return (
    <>
      {data.slice(page * 10, page * 10 + 10).map((item: any, index: number) => (
        <Box key={index}>{mobileHTML(item, index)}</Box>
      ))}
      <TablePagination
        rowsPerPageOptions={[10]}
        className='tablePagination'
        component='div'
        count={count}
        rowsPerPage={10}
        page={page}
        onPageChange={(event: unknown, newPage: number) => {
          setPage(newPage);
        }}
      />
    </>
  );
};

export default CustomTableMobile;
