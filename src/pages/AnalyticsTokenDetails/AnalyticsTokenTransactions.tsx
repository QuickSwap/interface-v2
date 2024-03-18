import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionsTable } from 'components';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { exportToXLSX } from 'utils/exportToXLSX';
import { formatNumber } from 'utils';
import { TxnType } from 'constants/index';
import { getConfig } from 'config/index';
import Loader from 'components/Loader';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface Props {
  transactions: any[];
  symbol: string;
}

const AnalyticsTokenTransactions: React.FC<Props> = ({
  transactions,
  symbol,
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const config = getConfig(chainId);
  const networkName = config['networkName'];

  const [xlsExported, setXLSExported] = useState(false);

  const getTxString = (txn: any) => {
    const messageData = {
      token0Symbol: txn.pair.token1.symbol,
      token1Symbol: txn.pair.token0.symbol,
    };
    if (txn.type === TxnType.SWAP) {
      return t('txnSwapMessage', messageData);
    } else if (txn.type === TxnType.ADD) {
      return t('txnAddMessage', messageData);
    } else if (txn.type === TxnType.REMOVE) {
      return t('txnRemoveMessage', messageData);
    }
    return '';
  };

  useEffect(() => {
    if (xlsExported) {
      const exportData = transactions
        .sort((tx1: any, tx2: any) => {
          return Number(tx1.transaction.timestamp) >
            Number(tx2.transaction.timestamp)
            ? -1
            : 1;
        })
        .map((txn: any) => {
          return {
            Description: getTxString(txn),
            'Total Value': `$${formatNumber(txn.amountUSD)}`,
            'Token0 Amount': `${formatNumber(txn.amount1)} ${
              txn.pair.token1.symbol
            }`,
            'Token1 Amount': `${formatNumber(txn.amount0)} ${
              txn.pair.token0.symbol
            }`,
            'TX Hash': txn.transaction.id,
            Time: dayjs(Number(txn.transaction.timestamp) * 1000).fromNow(),
          };
        });
      exportToXLSX(
        exportData,
        `Quickswap-${symbol}-Transactions-${networkName}-${version}`,
      );
      setTimeout(() => {
        setXLSExported(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsExported]);

  return (
    <>
      <Box width={1} className='flex justify-between items-center'>
        <p>
          {symbol} {t('transactions')}
        </p>
        <Box
          className={`bg-secondary1 flex items-center ${
            xlsExported ? '' : 'cursor-pointer'
          }`}
          padding='4px 8px'
          borderRadius={6}
          onClick={() => {
            if (!xlsExported) setXLSExported(true);
          }}
        >
          {xlsExported ? <Loader /> : <small>{t('export')}</small>}
        </Box>
      </Box>
      <Box width={1} className='panel' mt={4}>
        <TransactionsTable data={transactions} />
      </Box>
    </>
  );
};

export default AnalyticsTokenTransactions;
