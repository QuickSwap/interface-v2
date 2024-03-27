import React from 'react';
import { CurrencyLogo, CustomModal } from 'components';
import { useMemo, useState } from 'react';
import { useActiveWeb3React, useGetConnection } from 'hooks';
import 'components/styles/AssetModal.scss';
import { useSelectedWallet } from '../../state/user/hooks';
import NotifyModal from '../NotifyModal';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw,
} from '@orderly.network/hooks';
import { Box, Button } from '@material-ui/core';
import { ArrowDownward } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import { useCurrency } from 'hooks/v3/Tokens';
import { NumericalInput } from 'components';
import QuickPerpsIcon from 'assets/images/quickPerpsIcon.svg';

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  modalType: string;
}
const AssetModal: React.FC<AssetModalProps> = ({
  open,
  onClose,
  modalType,
}) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(modalType);
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const { selectedWallet } = useSelectedWallet();
  const getConnection = useGetConnection();
  const [chains, { findByChainId }] = useChains('mainnet');
  const connections = selectedWallet
    ? getConnection(selectedWallet)
    : undefined;
  const { account, state } = useAccount();
  const collateral = useCollateral();
  const [notifications, setNotifications] = useState(false);
  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const [depositAmount, setDepositAmount] = useState<string | undefined>();
  const [withdrawAmount, setWithdrawAmount] = useState<string | undefined>();
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });
  const { withdraw } = useWithdraw();
  const config = getConfig(chainId);
  const currency = useCurrency(token?.address);

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Box padding={2}>
        <Box className='assetTabsWrapper' gridGap={24}>
          <p
            className={`${selectedTab === 'deposit' ? 'selectedAssetTab' : ''}`}
            onClick={() => setSelectedTab('deposit')}
          >
            {t('deposit')}
          </p>
          <p
            className={`${
              selectedTab === 'withdraw' ? 'selectedAssetTab' : ''
            }`}
            onClick={() => setSelectedTab('withdraw')}
          >
            {t('withdraw')}
          </p>
        </Box>
        <Box
          mt='20px'
          className={`flex ${
            selectedTab === 'deposit' ? 'flex-col' : 'flex-col-reverse'
          }`}
          gridGap={8}
        >
          <Box className='flex flex-col'>
            <Box className='flex justify-between items-start'>
              <small>{t('yourWeb3Wallet')}</small>
              {connections && (
                <img src={connections.iconName} width='16' height='16' />
              )}
            </Box>
            <Box className='flex items-center' gridGap={8}>
              <Box className='assetInfoWrapper'>
                <small>
                  {quickSwapAccount
                    ? quickSwapAccount.substring(0, 6) +
                      '...' +
                      quickSwapAccount.substring(quickSwapAccount.length - 4)
                    : 'Connect Wallet'}
                </small>
              </Box>
              <Box className='assetInfoWrapper' gridGap={8}>
                <img
                  src={config['nativeCurrencyImage']}
                  width={20}
                  height={20}
                />
                <small>{config['networkName']}</small>
              </Box>
            </Box>
            <Box className='assetModalInputWrapper' mt={1}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>
                  {selectedTab === 'deposit' ? 'Quantity' : 'Receive'}
                </small>
                <Box className='flex items-center' gridGap={12}>
                  <span className='text-primary cursor-pointer'>
                    {t('max')}
                  </span>
                  <Box className='flex items-center' gridGap={4}>
                    <CurrencyLogo
                      currency={currency ?? undefined}
                      size='16px'
                    />
                    <small>{token?.symbol}</small>
                  </Box>
                </Box>
              </Box>
              <Box className='flex' mt={1} gridGap={6}>
                <NumericalInput
                  value={
                    (selectedTab === 'deposit'
                      ? depositAmount
                      : withdrawAmount) ?? ''
                  }
                  onUserInput={(value) => {
                    selectedTab === 'deposit'
                      ? setDepositAmount(value)
                      : setWithdrawAmount(value);
                  }}
                  placeholder='$0.00'
                  fontSize={14}
                  fontWeight='500'
                />
                <Box className='flex' gridGap={4}>
                  <span className='text-secondary'>{t('available')}:</span>
                  <span>{parseFloat(deposit.balance).toFixed(2)}</span>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className='assetModalLineWrapper'>
            <div className='assetModalLine' />
            <div className='assetModalArrow'>
              <ArrowDownward />
            </div>
          </Box>
          <Box>
            <Box className='flex items-center justify-between'>
              <small>{t('yourQuickPerpsAccount')}</small>
              <img src={QuickPerpsIcon} />
            </Box>
            <Box className='assetModalInputWrapper' mt={1}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>
                  {selectedTab === 'deposit' ? 'Receive' : 'Quantity'}
                </small>
                <span>USDC</span>
              </Box>
              <Box className='flex' mt={1} gridGap={6}>
                <NumericalInput
                  value={
                    (selectedTab === 'deposit'
                      ? depositAmount
                      : withdrawAmount) ?? ''
                  }
                  onUserInput={(val) => {
                    selectedTab === 'deposit'
                      ? setDepositAmount(val)
                      : setWithdrawAmount(val);
                  }}
                  placeholder='$0.00'
                  fontSize={14}
                  fontWeight='500'
                />
                <Box className='flex' gridGap={4}>
                  <span className='text-secondary'>{t('available')}:</span>
                  <span>{collateral.availableBalance?.toFixed(2)}</span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {selectedTab !== 'withdraw' && (
          <Box mt={2}>
            <span className='text-secondary'>1 USDC = 1 USD</span>
          </Box>
        )}
        <Box margin='8px 0 16px'>
          <span className='text-secondary'>Fee = $0</span>
        </Box>

        {selectedTab === 'deposit' ? (
          <Button
            className='assetModalButton'
            disabled={depositAmount == null}
            onClick={async () => {
              if (depositAmount == null) return;
              if (Number(deposit.allowance) < Number(depositAmount)) {
                await deposit.approve(depositAmount.toString());
              } else {
                deposit.setQuantity(depositAmount.toString());
                const tx = await deposit.deposit();
                setNotifications(true);
              }
            }}
          >
            {Number(deposit.allowance) < Number(depositAmount)
              ? t('approve')
              : t('deposit')}
          </Button>
        ) : (
          <Button
            className='assetModalButton'
            disabled={withdrawAmount == null}
            onClick={async () => {
              if (withdrawAmount == null) return;
              await withdraw({
                chainId: Number(chainId),
                amount: withdrawAmount,
                token: 'USDC',
                allowCrossChainWithdraw: false,
              });
            }}
          >
            {t('withdraw')}
          </Button>
        )}
      </Box>
      <NotifyModal
        open={notifications}
        onClose={() => setNotifications(false)}
      />
    </CustomModal>
  );
};
export default AssetModal;
