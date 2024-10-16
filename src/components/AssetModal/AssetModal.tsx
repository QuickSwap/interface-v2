import React from 'react';
import { CurrencyLogo, CustomModal } from 'components';
import { useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import 'components/styles/AssetModal.scss';
import { NotifyModal } from './NotifyModal';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  usePositionStream,
  useWithdraw,
} from '@orderly.network/hooks';
import { Box, Button } from '@material-ui/core';
import { ArrowDownward } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import { useCurrency } from 'hooks/v3/Tokens';
import { NumericalInput } from 'components';
import QuickPerpsIcon from 'assets/images/quickPerpsIcon.svg';
import { useWalletInfo } from '@web3modal/ethers5/react';
import { useQuery } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';

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
  const { account: quickSwapAccount, chainId } = useActiveWeb3React();
  const { walletInfo } = useWalletInfo();
  const [chains] = useChains('mainnet');
  const chainData = chains.find(
    (item) => item.network_infos.chain_id === chainId,
  );
  const collateral = useCollateral();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const token = useMemo(() => {
    return chainData ? chainData.token_infos[0] : undefined;
  }, [chainData]);
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
  const { account } = useAccount();
  const [depositTx, setDepositTx] = useState<any>(undefined);
  const { data } = useQuery<API.Token[]>(
    `/v1/public/token/?chain_id=${chainId}`,
  );

  let withdrawalFee = 1;

  if (data) {
    withdrawalFee = data[0].chain_details[0].withdrawal_fee;
  }

  const [aggregatedData] = usePositionStream();
  const unsettledPnl = Number(aggregatedData?.aggregated?.unsettledPnL ?? 0);

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
              <small>{t('yourWallet')}</small>
              {walletInfo && (
                <img src={walletInfo.icon} width='16' height='16' />
              )}
            </Box>
            <Box className='flex items-center' gridGap={8}>
              <Box className='assetInfoWrapper'>
                <small>
                  {quickSwapAccount
                    ? quickSwapAccount.substring(0, 6) +
                      '...' +
                      quickSwapAccount.substring(quickSwapAccount.length - 4)
                    : t('connectWallet')}
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
                  {selectedTab === 'deposit' && (
                    <span
                      className='text-primary cursor-pointer'
                      onClick={() => {
                        setDepositAmount(deposit.balance);
                        deposit.setQuantity(deposit.balance);
                      }}
                    >
                      {t('max')}
                    </span>
                  )}
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
                    if (selectedTab === 'deposit') {
                      deposit.setQuantity(value);
                    }
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
              <small>{t('yourFalkorAccount')}</small>
              <img src={QuickPerpsIcon} alt='Falkor' />
            </Box>
            <Box className='assetModalInputWrapper' mt={1}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>
                  {selectedTab === 'deposit' ? 'Quantity' : 'Receive'}
                </small>
                <Box className='flex items-center' gridGap={12}>
                  {selectedTab === 'withdraw' && (
                    <span
                      className='text-primary cursor-pointer'
                      onClick={() =>
                        setWithdrawAmount(
                          collateral?.availableBalance.toString(),
                        )
                      }
                    >
                      {t('max')}
                    </span>
                  )}
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
          <span className='text-secondary'>
            {t('fee')} = ${selectedTab === 'deposit' ? '0' : withdrawalFee}
          </span>
        </Box>

        {selectedTab === 'deposit' ? (
          <Button
            className='assetModalButton'
            disabled={loading || !depositAmount || !Number(depositAmount)}
            onClick={async () => {
              if (!depositAmount) return;
              if (Number(deposit.allowance) < Number(depositAmount)) {
                try {
                  setLoading(true);
                  await deposit.approve(depositAmount.toString());
                  setLoading(false);
                } catch {
                  setLoading(false);
                }
              } else {
                try {
                  setLoading(true);
                  const res = await deposit.deposit();
                  setDepositTx(res);
                  setNotifications(true);
                  setLoading(false);
                } catch {
                  setLoading(false);
                }
              }
            }}
          >
            {Number(deposit.allowance) < Number(depositAmount)
              ? loading
                ? t('approving')
                : t('approve')
              : loading
              ? t('depositing')
              : t('deposit')}
          </Button>
        ) : (
          <Button
            className='assetModalButton'
            disabled={loading || !withdrawAmount || !Number(withdrawAmount)}
            onClick={async () => {
              if (!withdrawAmount) return;
              try {
                setLoading(true);
                if (unsettledPnl !== 0) {
                  await account.settle();
                }
                await withdraw({
                  chainId: Number(chainId),
                  amount: withdrawAmount,
                  token: 'USDC',
                  allowCrossChainWithdraw: false,
                });
                setLoading(false);
              } catch (e) {
                console.log('Withdraw Error ', e);
                setLoading(false);
              }
            }}
          >
            {loading ? t('withdrawing') : t('withdraw')}
          </Button>
        )}
      </Box>
      {notifications && (
        <NotifyModal
          open={notifications}
          onClose={() => setNotifications(false)}
          tx={depositTx}
        />
      )}
    </CustomModal>
  );
};
export default AssetModal;
