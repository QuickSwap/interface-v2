import React, { ReactChild } from 'react';
import { Box, useMediaQuery, TableRow, TableCell } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import { DataTable } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  tableContainer: {
    '& .MuiTableContainer-root': {
      overflow: 'unset',
    },
    '& thead': {
      height: 53,
    },
    '& tbody tr': {
      height: 57,
    },
    '& thead tr th, & tbody tr td': {
      fontSize: 14,
      borderBottom: `1px solid ${palette.divider}`,
      '&.buttonCell': {
        width: 110,
        padding: '6px 10px 6px 0',
        '& button': {
          padding: 0,
          margin: 0,
          width: '100%',
          height: 40,
          fontSize: 14,
          fontWeight: 700,
        },
      },
    },
    '& thead tr th': {
      padding: '7px 6px',
      cursor: 'pointer',
      '&:first-child': {
        padding: '7px 0px 7px 23px',
        [breakpoints.down('sm')]: {
          padding: '7px 6px 7px 13px',
        },
      },
      '&.buttonCell': {
        '& > div > div': {
          width: '100%',
        },
        '& button': {
          color: palette.text.secondary,
        },
        '& .removeAll': {
          '& p': {
            margin: 0,
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& b': {
              fontSize: 14,
            },
            '& svg': {
              width: 12,
              height: 12,
              marginTop: -1,
            },
          },
        },
      },
    },
    '& tbody tr td': {
      padding: '6px',
      borderBottom: 'none',
      '&:first-child': {
        padding: '6px 0px 6px 15px',
        [breakpoints.down('sm')]: {
          padding: '6px',
        },
      },
      '&.buttonCell.MuiButton-textPrimary': {
        '& button': {
          color: palette.common.white,
          '&:hover': {
            color: palette.primary.main,
          },
        },
      },
    },
  },
}));

export interface CustomTableProps {
  emptyMessage?: string;
  showPagination?: boolean;
  rowsPerPage?: number;
  headCells: any;
  data: any;
  mobileHTML: (item: any, index: number) => ReactChild;
  desktopHTML: (
    item: any,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => any;
}

const CustomTable: React.FC<CustomTableProps> = ({
  rowsPerPage = 5,
  showPagination = true,
  emptyMessage,
  headCells,
  data,
  mobileHTML,
  desktopHTML,
}) => {
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useStyles();

  return (
    <Box className={classes.tableContainer}>
      {mobileWindowSize ? (
        <>
          {data.map((item: any, index: number) => {
            return mobileHTML(item, index);
          })}
        </>
      ) : (
        <DataTable
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
                    <TableCell
                      key={ind}
                      className={cellItem.button ? 'buttonCell' : ''}
                    >
                      {cellItem.html}
                    </TableCell>
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
