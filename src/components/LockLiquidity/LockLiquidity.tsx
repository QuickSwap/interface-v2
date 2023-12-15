import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  CurrencyInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo,
} from 'components';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import {
  currencyEquals,
  Token,
  ETHER,
  TokenAmount,
  ChainId,
  Pair,
} from '@uniswap/sdk';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import {
  useIsSupportedNetwork,
  formatTokenAmount,
} from 'utils';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { useTokenBalance } from 'state/wallet/hooks';

const defaultDate = '2024-12-24T10:30'

const LockLiquidity: React.FC = () => {
  const { t } = useTranslation();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { account, chainId, library } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = Token.ETHER[chainIdToUse];

  // inputs
  const [isV3, setIsV3] = useState(false);
  const [unlockDate, setUnlockDate] = useState(new Date(defaultDate))
  const [lpTokenAddress, setLpTokenAddress] = useState('');
  const [amount, setAmount] = useState('')

  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();

  const {
    loading: v2IsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);

  const lpToken = useMemo(() => {
    return allV2PairsWithLiquidity.find((item) => item.liquidityToken.address === lpTokenAddress)
  }, [allV2PairsWithLiquidity]);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    lpToken?.liquidityToken,
  );

  // TODO: Uncomment for approval
  /* const [showConfirm, setShowConfirm] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [approving, setApproving] = useState(false);
    const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    contractAddress : undefined,
  ); */

  const handleChange = (e: any) => {
      setLpTokenAddress(e.target.value);
  };

  const handleChangeDate = (e: string) => {
    setUnlockDate(new Date(e));
 };

  const connectWallet = () => {
    if (!isSupportedNetwork) {
      toggleNetworkSelectionModal();
    } else {
      toggleWalletModal();
    }
  };

  return (
    <Box>
      <Box p={2} className='bg-secondary2 rounded-md'>
        <Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel>LP Token</InputLabel>
            <Select
              value={lpTokenAddress}
              onChange={handleChange}
              label="LP Token"
              renderValue={(value) => `Address: ${value}`}
            >
              <MenuItem value=''>
                <em>None</em>
              </MenuItem>
              {allV2PairsWithLiquidity.map((pair) => (
                <MenuItem key={pair.liquidityToken.address} value={pair.liquidityToken.address}>{pair.liquidityToken.address}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box mt={2.5}>
          <TextField value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" fullWidth label="Amount to lock" variant="outlined" />
          <small>{formatTokenAmount(userPoolBalance)}</small>
        </Box>
        <Box mt={2.5}>
          <TextField
            fullWidth
            label="Lock until"
            type="datetime-local"
            defaultValue={defaultDate}
            onChange={(e)=> handleChangeDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </Box>
      <Box className='swapButtonWrapper'>
        <Button
          fullWidth
          onClick={() => console.log('click approve')}
        >
          Approve
        </Button>
      </Box>
      <Box mt={2} className='swapButtonWrapper'>
        <Button
          fullWidth
          disabled
          onClick={() => console.log('click lock liquidity')}
        >
          Lock Liquidity
        </Button>
      </Box>
    </Box>
  );
};

export default LockLiquidity;
