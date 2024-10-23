import React, { useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
} from '@orderly.network/hooks';
import AssetModal from '../../components/AssetModal';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import AccountManageModal from './AccountManageModal';
import { AccountStatusEnum } from '@orderly.network/types';

export const LeverageManage: React.FC = () => {
  const { t } = useTranslation();

  const [openAccountManage, setOpenAccountManage] = useState(false);
  const { account: quickSwapAccount, chainId } = useActiveWeb3React();
  const { state } = useAccount();
  const [chains] = useChains('mainnet');
  const chainData = chains.find(
    (item) => item.network_infos.chain_id === chainId,
  );

  const token = useMemo(() => {
    return chainData ? chainData.token_infos[0] : undefined;
  }, [chainData]);
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
      <Box
        pb={2}
        mb={2}
        className='flex items-center justify-between border-bottom'
      >
        <p className='span'>My Account</p>
        {state.status === AccountStatusEnum.EnableTrading && (
          <Button
            className='leverageManageButton'
            disabled={!quickSwapAccount}
            onClick={() => {
              setOpenAccountManage(true);
            }}
          >
            {t('manage')}
          </Button>
        )}
      </Box>
      <Box className='flex items-center justify-between flex-wrap' gridGap={8}>
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
        {quickSwapAccount && state.status === AccountStatusEnum.EnableTrading && (
          <p
            className='span text-primary weight-500 cursor-pointer'
            onClick={() => {
              if (quickSwapAccount) {
                setModalOpen(true);
              }
            }}
          >
            {t('deposit')} / {t('withdraw')}
          </p>
        )}
      </Box>
      {modalOpen && (
        <AssetModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          modalType={'deposit'}
        />
      )}
      {openAccountManage && (
        <AccountManageModal
          open={openAccountManage}
          onClose={() => setOpenAccountManage(false)}
        />
      )}
    </>
  );
};
