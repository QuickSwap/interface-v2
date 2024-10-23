import React, { useEffect, useState } from 'react';
import { usePrivateQuery } from '@orderly.network/hooks';
import './Layout.scss';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { formatNumber } from 'utils';
import dayjs from 'dayjs';
import { FooterPagination } from './FooterPagination';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { Download, Upload } from 'react-feather';

interface AssetHistory {
  amount: number;
  chain_id: string;
  created_time: number;
  fee: number;
  id: string;
  side: string;
  token: string;
  trans_status: string;
  tx_id: string;
  updated_time: string;
}

export const FooterAssetHistoryTable: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const [countPerPage, setCountPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const { isLoading, data } = usePrivateQuery('/v1/asset/history');
  const assetHistory = (data ?? []) as AssetHistory[];
  const filteredAssetHistory = assetHistory.filter(
    (item) => Number(item.chain_id) === chainId,
  );

  useEffect(() => {
    setPageIndex(0);
  }, []);

  const headCells = [
    {
      id: 'date',
      label: 'Date',
      html: (item: AssetHistory) => (
        <small>{dayjs(item.updated_time).format('MM.DD.YYYY')}</small>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      html: (item: AssetHistory) => (
        <Box className='flex items-center' gridGap={5}>
          {item.side === 'DEPOSIT' ? <Download /> : <Upload />}
          <small>{item.side}</small>
        </Box>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      html: (item: AssetHistory) => (
        <small>
          {formatNumber(item.amount)} {item.token}
        </small>
      ),
    },

    {
      id: 'viewTxn',
      label: '',
      html: (item: AssetHistory) => (
        <a
          href={`${config.blockExplorer}/tx/${item.tx_id}`}
          target='_blank'
          rel='noreferrer'
        >
          <small className='text-primary'>View Txn</small>
        </a>
      ),
    },
  ];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <div>
      {isMobile ? (
        filteredAssetHistory.length > 0 ? (
          filteredAssetHistory
            .slice(countPerPage * pageIndex, countPerPage * (pageIndex + 1))
            .map((history) => (
              <Box key={history.id} padding='12px'>
                <Grid container spacing={1}>
                  {headCells.map((item) => (
                    <Grid item key={item.id} xs={6} sm={4}>
                      <small className='text-secondary weight-500'>
                        {item.label}
                      </small>
                      <Box mt='6px'>{item.html(history)}</Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
        ) : (
          <Box className='flex items-center justify-center' p={2}>
            <p>{isLoading ? 'Loading...' : 'No Deposit nor Withdraw'}</p>
          </Box>
        )
      ) : (
        <div className='perpsFooterTable'>
          <table>
            <thead>
              <tr>
                {headCells.map((item) => (
                  <th key={item.id} align='left' className='border-bottom'>
                    <Box p='6px' height='40px' className='flex items-center'>
                      <small className='text-secondary weight-500'>
                        {item.label}
                      </small>
                    </Box>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssetHistory.length > 0 ? (
                filteredAssetHistory
                  .slice(
                    countPerPage * pageIndex,
                    countPerPage * (pageIndex + 1),
                  )
                  .map((history) => (
                    <tr key={history.id}>
                      {headCells.map((cell) => (
                        <td key={cell.id}>
                          <Box
                            p='6px'
                            height='40px'
                            className='flex items-center'
                          >
                            {cell.html(history)}
                          </Box>
                        </td>
                      ))}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={headCells.length}>
                    <Box className='flex items-center justify-center' py={2}>
                      <p>
                        {isLoading ? 'Loading...' : 'No Deposit nor Withdraw'}
                      </p>
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {filteredAssetHistory.length > 5 && (
        <FooterPagination
          countPerPage={countPerPage}
          setCountPerPage={setCountPerPage}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          dataCount={filteredAssetHistory.length}
        />
      )}
    </div>
  );
};
