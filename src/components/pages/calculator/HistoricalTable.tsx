import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import styles from 'styles/pages/Calculator.module.scss';

interface HistoricalPrice {
  date: string;
  price: number;
  difference: number;
  change: number;
}

export const HistoricalTable: React.FC<{
  prices: number[];
  dates: number[];
}> = ({ prices, dates }) => {
  const data = useMemo(() => {
    if (Array.isArray(prices) && Array.isArray(dates)) {
      let lastPrice: number | undefined = undefined;
      const pricePonints: HistoricalPrice[] = prices.map((p, i) => {
        const dt = dates[i];
        const difference = lastPrice ? p - lastPrice : 0;
        const change = lastPrice ? (difference * 100) / lastPrice : 0;
        const value: HistoricalPrice = {
          date: new Date(dt * 1000).toUTCString().substring(4, 16),
          price: p,
          difference,
          change,
        };

        lastPrice = p;

        return value;
      });

      pricePonints.reverse().pop();
      return pricePonints;
    }
    return [];
  }, [dates, prices]);

  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <Box mb={3}>
        <Box className={`${styles.subHeading} ${styles.subHeading20}`}>
          {t('ethHistoricalTableHeading')}
        </Box>
      </Box>
      <Box>
        <TableContainer component={Paper} style={{ background: '#1b1e29' }}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell
                  className={`${styles.textDark} ${styles.darkBorder}`}
                >
                  Date
                </TableCell>
                <TableCell
                  className={`${styles.textDark} ${styles.darkBorder}`}
                  align='center'
                >
                  0.01 ETH to USD
                </TableCell>
                <TableCell
                  className={`${styles.textDark} ${styles.darkBorder}`}
                  align='center'
                >
                  Difference
                </TableCell>
                <TableCell
                  className={`${styles.textDark} ${styles.darkBorder}`}
                  align='right'
                >
                  Change
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.date}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell className={styles.textLight}>{row.date}</TableCell>
                  <TableCell className={styles.textLight} align='center'>
                    {row.price.toFixed(3)}
                  </TableCell>
                  <TableCell className={styles.textLight} align='center'>
                    {row.difference.toFixed(3)}
                  </TableCell>
                  <TableCell
                    className={
                      row.change > 0
                        ? `${styles.textSuccess} ${styles.darkBorder}`
                        : `${styles.textDanger} ${styles.darkBorder}`
                    }
                    align='right'
                  >
                    {row.change.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
