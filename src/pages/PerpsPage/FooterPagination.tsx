import React, { useEffect } from 'react';
import { Box, Select, MenuItem } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

interface Props {
  countPerPage: number;
  setCountPerPage: (val: number) => void;
  pageIndex: number;
  setPageIndex: (val: number) => void;
  dataCount: number;
}

export const FooterPagination: React.FC<Props> = ({
  countPerPage,
  setCountPerPage,
  pageIndex,
  setPageIndex,
  dataCount,
}) => {
  const countPerPageOptions = [5, 10, 15];

  useEffect(() => {
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countPerPage]);

  return (
    <Box className='perpsFooterPagination' gridGap={8} my={2}>
      <Box className='perpsBottomDropdown'>
        <Select
          defaultValue={5}
          value={countPerPage}
          onChange={(e) => {
            setCountPerPage(Number(e.target.value));
          }}
        >
          {countPerPageOptions.map((option) => (
            <MenuItem
              className='perpsBottomDropdownItem'
              value={option}
              key={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box className='perpFooterPaginationPage'>
        <Box
          className={pageIndex > 0 ? 'cursor-pointer' : ''}
          onClick={() => {
            if (pageIndex > 0) {
              setPageIndex(pageIndex - 1);
            }
          }}
        >
          <KeyboardArrowLeft
            className={pageIndex > 0 ? '' : 'text-secondary'}
          />
        </Box>
        <Box
          className={
            pageIndex <
            Math.floor(dataCount / countPerPage) -
              (dataCount % countPerPage > 0 ? 0 : 1)
              ? 'cursor-pointer'
              : ''
          }
          onClick={() => {
            if (
              pageIndex <
              Math.floor(dataCount / countPerPage) -
                (dataCount % countPerPage > 0 ? 0 : 1)
            ) {
              setPageIndex(pageIndex + 1);
            }
          }}
        >
          <KeyboardArrowRight
            className={
              pageIndex <
              Math.floor(dataCount / countPerPage) -
                (dataCount % countPerPage > 0 ? 0 : 1)
                ? ''
                : 'text-secondary'
            }
          />
        </Box>
      </Box>
    </Box>
  );
};
