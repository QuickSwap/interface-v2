import NON_FUN_POS_MAN from 'abis/non-fun-pos-man.json';
import FARMING_CENTER_ABI from 'abis/farming-center.json';
import { Contract, providers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { useCallback, useState, useMemo } from 'react';
import {
  FARMING_CENTER,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from '../constants/v3/addresses';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from '../state/transactions/hooks';
import { useActiveWeb3React } from 'hooks';
import JSBI from 'jsbi';
import { GAS_PRICE_MULTIPLIER } from './useGasPrice';
import { TransactionResponse } from '@ethersproject/providers';
import { DefaultFarming, DefaultFarmingWithError } from '../models/interfaces';
import { FarmingType } from '../models/enums';
import { useTranslation } from 'react-i18next';
import { toHex } from 'lib/src/utils/calldata';
import { useAppSelector } from 'state';
import { useV3StakeData } from 'state/farms/hooks';

export function useFarmingHandlers() {
  const { chainId, account, library } = useActiveWeb3React();
  const { t } = useTranslation();

  const provider = useMemo(() => {
    if (!library) return;
    return new providers.Web3Provider(library.provider);
  }, [library]);

  const gasPrice = useAppSelector((state) => {
    if (!state.application.gasPrice.fetched) return 36;
    return state.application.gasPrice.override
      ? 36
      : state.application.gasPrice.fetched;
  });

  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();

  const { updateV3Stake } = useV3StakeData();

  //exit from basic farming and claim than
  const claimRewardsHandler = useCallback(
    async (
      token,
      {
        limitRewardToken,
        limitBonusRewardToken,
        pool,
        limitStartTime,
        limitEndTime,
        eternalRewardToken,
        eternalBonusRewardToken,
        eternalStartTime,
        eternalEndTime,
        eternalBonusEarned,
        eternalEarned,
        limitBonusEarned,
        limitEarned,
      },
      farmingType,
    ) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: token,
        selectedFarmingType: farmingType,
        txType: 'claimRewards',
        txConfirmed: false,
        txHash: '',
        txError: '',
      });

      const MaxUint128 = toHex(
        JSBI.subtract(
          JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)),
          JSBI.BigInt(1),
        ),
      );

      const farmingCenterContract = new Contract(
        FARMING_CENTER[chainId],
        FARMING_CENTER_ABI,
        provider.getSigner(),
      );

      try {
        const farmingCenterInterface = new Interface(FARMING_CENTER_ABI);

        let callDatas: string[], result: TransactionResponse;

        if (farmingType === FarmingType.ETERNAL) {
          callDatas = [
            farmingCenterInterface.encodeFunctionData('exitFarming', [
              [
                eternalRewardToken.id,
                eternalBonusRewardToken.id,
                pool.id,
                +eternalStartTime,
                +eternalEndTime,
              ],
              +token,
              false,
            ]),
          ];

          if (Boolean(+eternalEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                eternalRewardToken.id,
                account,
                0,
                MaxUint128,
              ]),
            );
          }

          if (Boolean(+eternalBonusEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                eternalBonusRewardToken.id,
                account,
                0,
                MaxUint128,
              ]),
            );
          }

          result = await farmingCenterContract.multicall(callDatas, {
            gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
            gasLimit: 350000,
          });
        } else {
          callDatas = [
            farmingCenterInterface.encodeFunctionData('exitFarming', [
              [
                limitRewardToken.id,
                limitBonusRewardToken.id,
                pool.id,
                +limitStartTime,
                +limitEndTime,
              ],
              +token,
              true,
            ]),
          ];

          if (Boolean(+limitEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                limitRewardToken.id,
                account,
                MaxUint128,
                0,
              ]),
            );
          }

          if (Boolean(+limitBonusEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                limitBonusRewardToken.id,
                account,
                MaxUint128,
                0,
              ]),
            );
          }

          result = await farmingCenterContract.multicall(callDatas, {
            gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
            gasLimit: 350000,
          });
        }

        addTransaction(result, {
          summary: t('undepositNFT', { nftID: token }),
        });

        updateV3Stake({ txHash: result.hash });

        const receipt = await result.wait();

        finalizeTransaction(receipt, {
          summary: t('undepositedNFT', { nftID: token }),
        });

        updateV3Stake({ txConfirmed: true });
      } catch (err) {
        updateV3Stake({ txError: 'failed' });
        if (err.code !== 4001) {
          throw new Error(t('undeposit') + ' ' + err.message);
        }
      }
    },
    [
      account,
      addTransaction,
      chainId,
      finalizeTransaction,
      gasPrice,
      provider,
      updateV3Stake,
      t,
    ],
  );

  //collect rewards and claim than
  const eternalCollectRewardHandler = useCallback(
    async (
      token,
      {
        pool,
        eternalRewardToken,
        eternalBonusRewardToken,
        eternalStartTime,
        eternalEndTime,
      },
    ) => {
      if (!account || !provider || !chainId) return;

      const farmingCenterContract = new Contract(
        FARMING_CENTER[chainId],
        FARMING_CENTER_ABI,
        provider.getSigner(),
      );

      const farmingCenterInterface = new Interface(FARMING_CENTER_ABI);

      updateV3Stake({
        selectedTokenId: token,
        selectedFarmingType: null,
        txType: 'eternalCollectReward',
        txConfirmed: false,
        txHash: '',
        txError: '',
      });

      try {
        const MaxUint128 = toHex(
          JSBI.subtract(
            JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)),
            JSBI.BigInt(1),
          ),
        );

        const collectRewards = farmingCenterInterface.encodeFunctionData(
          'collectRewards',
          [
            [
              eternalRewardToken.id,
              eternalBonusRewardToken.id,
              pool.id,
              +eternalStartTime,
              +eternalEndTime,
            ],
            +token,
          ],
        );
        const claimReward1 = farmingCenterInterface.encodeFunctionData(
          'claimReward',
          [eternalRewardToken.id, account, 0, MaxUint128],
        );
        const claimReward2 = farmingCenterInterface.encodeFunctionData(
          'claimReward',
          [eternalBonusRewardToken.id, account, 0, MaxUint128],
        );

        let result: TransactionResponse;

        if (
          eternalRewardToken.id.toLowerCase() !==
          eternalBonusRewardToken.id.toLowerCase()
        ) {
          result = await farmingCenterContract.multicall(
            [collectRewards, claimReward1, claimReward2],
            { gasPrice: gasPrice * GAS_PRICE_MULTIPLIER },
          );
        } else {
          result = await farmingCenterContract.multicall(
            [collectRewards, claimReward1],
            { gasPrice: gasPrice * GAS_PRICE_MULTIPLIER },
          );
        }

        addTransaction(result, {
          summary: t('claimingReward'),
        });

        updateV3Stake({ txHash: result.hash });

        const receipt = await result.wait();

        finalizeTransaction(receipt, {
          summary: t('claimedReward'),
        });

        updateV3Stake({ txConfirmed: true });
      } catch (err) {
        updateV3Stake({ txError: 'failed' });
        if (err instanceof Error) {
          throw new Error(t('claimingReward') + ' ' + err.message);
        }
      }
    },
    [
      account,
      addTransaction,
      chainId,
      finalizeTransaction,
      gasPrice,
      provider,
      updateV3Stake,
      t,
    ],
  );

  const withdrawHandler = useCallback(
    async (token) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: token,
        selectedFarmingType: null,
        txType: 'withdraw',
        txConfirmed: false,
        txHash: '',
        txError: '',
      });

      try {
        const farmingCenterContract = new Contract(
          FARMING_CENTER[chainId],
          FARMING_CENTER_ABI,
          provider.getSigner(),
        );

        const result = await farmingCenterContract.withdrawToken(
          token,
          account,
          0x0,
          {
            gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
          },
        );

        addTransaction(result, {
          summary: t('withdrawingNFT', { nftID: token }) + '!',
        });

        updateV3Stake({ txHash: result.hash });

        const receipt = await result.wait();

        finalizeTransaction(receipt, {
          summary: t('withdrawnNFT', { nftID: token }),
        });

        updateV3Stake({ txConfirmed: true });
      } catch (err) {
        updateV3Stake({ txError: 'failed' });
        if (err instanceof Error) {
          throw new Error(t('withdrawing') + ' ' + err);
        }
      }
    },
    [
      account,
      addTransaction,
      chainId,
      finalizeTransaction,
      gasPrice,
      provider,
      updateV3Stake,
      t,
    ],
  );

  const farmHandler = useCallback(
    async (
      selectedNFT,
      { rewardToken, bonusRewardToken, pool, startTime, endTime },
      eventType,
      selectedTier,
    ) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: selectedNFT.id,
        selectedFarmingType: null,
        txType: 'farm',
        txConfirmed: false,
        txHash: '',
        txError: '',
      });

      let current;

      try {
        const farmingCenterContract = new Contract(
          FARMING_CENTER[chainId],
          FARMING_CENTER_ABI,
          provider.getSigner(),
        );

        if (selectedNFT.onFarmingCenter) {
          current = selectedNFT.id;

          const result = await farmingCenterContract.enterFarming(
            [rewardToken, bonusRewardToken, pool, startTime, endTime],
            +selectedNFT.id,
            selectedTier,
            eventType === FarmingType.LIMIT,
            {
              gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
            },
          );

          addTransaction(result, {
            summary: `${t('nftDepositing', { nftID: selectedNFT.id })}!`,
          });

          updateV3Stake({ txHash: result.hash });

          const receipt = await result.wait();

          finalizeTransaction(receipt, {
            summary: `${t('nftDeposited', { nftID: selectedNFT.id })}!`,
          });

          updateV3Stake({ txConfirmed: true });
        }
      } catch (err) {
        updateV3Stake({ txError: 'failed' });
        if (err instanceof Error) {
          throw new Error(t('depositing') + ' ' + current + ' ' + err.message);
        }
      }
    },
    [
      account,
      addTransaction,
      chainId,
      finalizeTransaction,
      gasPrice,
      provider,
      updateV3Stake,
      t,
    ],
  );

  const approveHandler = useCallback(
    async (selectedNFT) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: selectedNFT.id,
        selectedFarmingType: null,
        txType: 'farmApprove',
        txConfirmed: false,
        txHash: '',
        txError: '',
      });

      let current;

      try {
        const nonFunPosManInterface = new Interface(NON_FUN_POS_MAN);

        const nonFunPosManContract = new Contract(
          NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
          NON_FUN_POS_MAN,
          provider.getSigner(),
        );

        if (!selectedNFT.onFarmingCenter) {
          current = selectedNFT.id;

          const transferData = nonFunPosManInterface.encodeFunctionData(
            'safeTransferFrom(address,address,uint256)',
            [account, FARMING_CENTER[chainId], selectedNFT.id],
          );

          const result = await nonFunPosManContract.multicall([transferData], {
            gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
          });

          addTransaction(result, {
            summary: `${t('nftApproving', { nftID: selectedNFT.id })}!`,
          });

          updateV3Stake({ txHash: result.hash });

          const receipt = await result.wait();

          finalizeTransaction(receipt, {
            summary: `${t('nftApproved', { nftID: selectedNFT.id })}!`,
          });

          updateV3Stake({ txConfirmed: true });
        }
      } catch (err) {
        updateV3Stake({ txError: 'failed' });
        if (err instanceof Error) {
          throw new Error(t('approving') + ' ' + current + ' ' + err.message);
        }
      }
    },
    [
      account,
      addTransaction,
      chainId,
      finalizeTransaction,
      gasPrice,
      provider,
      updateV3Stake,
      t,
    ],
  );

  return {
    approveHandler,
    farmHandler,
    withdrawHandler,
    claimRewardsHandler,
    eternalCollectRewardHandler,
  };
}
