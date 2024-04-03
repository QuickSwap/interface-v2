import React, { useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { useChains, useCollateral, useDeposit } from '@orderly.network/hooks';
import AssetModal from '../../components/AssetModal';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';

export const LeverageManage: React.FC = () => {
  const { t } = useTranslation();

  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const [chains] = useChains('mainnet');

  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const collateral = useCollateral();

  return (
    <>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box>
          <p className='span text-secondary'>{t('totalWalletBalance')}</p>
          <p className='span'>
            {formatNumber(deposit?.balance)}{' '}
            <span className='text-secondary'>{token?.symbol}</span>
          </p>
          <Box mt={1}>
            <p className='span text-secondary'>{t('totalTradingBalance')} </p>
            <p className='span'>
              {formatNumber(collateral.availableBalance)}
              <span className='text-secondary'> {token?.symbol}</span>
            </p>
          </Box>
        </Box>
        <Box className='flex items-center' gridGap={8}>
          <Button
            className='leverageManageButton'
            disabled={!quickSwapAccount}
            onClick={() => {
              setModalOpen(true);
            }}
          >
            {t('deposit')}
          </Button>
        </Box>
      </Box>
      <AssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modalType={'deposit'}
      />
    </>
  );
};
