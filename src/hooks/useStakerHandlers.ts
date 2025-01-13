import NON_FUN_POS_MAN from 'abis/non-fun-pos-man.json';
import FARMING_CENTER_ABI from 'abis/farming-center.json';
import { Contract } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { useCallback } from 'react';
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
import { TransactionResponse } from '@ethersproject/providers';
import { FarmingType, TransactionType } from '../models/enums';
import { useTranslation } from 'react-i18next';
import { toHex } from 'lib/src/utils/calldata';
import { useV3StakeData } from 'state/farms/hooks';
import { calculateGasMargin } from 'utils';

export function useFarmingHandlers() {
  const { chainId, account, provider } = useActiveWeb3React();
  const { t } = useTranslation();

  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();

  const { updateV3Stake } = useV3StakeData();

  //exit from basic farming and claim than
  const claimRewardsHandler = useCallback(
    async (
      token: any,
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
        isDetached,
      }: any,
      farmingType: any,
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
                eternalRewardToken.address,
                eternalBonusRewardToken.address,
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
                eternalRewardToken.address,
                account,
                0,
                MaxUint128,
              ]),
            );
          }

          if (Boolean(+eternalBonusEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                eternalBonusRewardToken.address,
                account,
                0,
                MaxUint128,
              ]),
            );
          }

          if (isDetached) {
            const estimatedGas = await farmingCenterContract.estimateGas.multicall(
              callDatas,
            );

            result = await farmingCenterContract.multicall(callDatas, {
              gasLimit: calculateGasMargin(estimatedGas),
            });
          } else {
            let isSuccessful;
            try {
              result = await farmingCenterContract.callStatic.multicall(
                callDatas,
                {
                  gasLimit: 350000,
                },
              );
              isSuccessful = true;
            } catch (err) {
              const estimatedGas = await farmingCenterContract.estimateGas.multicall(
                [callDatas[0]],
              );
              result = await farmingCenterContract.multicall([callDatas[0]], {
                gasLimit: calculateGasMargin(estimatedGas),
              });
              console.log(err, result);
            }

            if (isSuccessful) {
              const estimatedGas = await farmingCenterContract.estimateGas.multicall(
                callDatas,
              );
              result = await farmingCenterContract.multicall(callDatas, {
                gasLimit: calculateGasMargin(estimatedGas),
              });
            }
          }
        } else {
          callDatas = [
            farmingCenterInterface.encodeFunctionData('exitFarming', [
              [
                limitRewardToken.address,
                limitBonusRewardToken.address,
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
                limitRewardToken.address,
                account,
                MaxUint128,
                0,
              ]),
            );
          }

          if (Boolean(+limitBonusEarned)) {
            callDatas.push(
              farmingCenterInterface.encodeFunctionData('claimReward', [
                limitBonusRewardToken.address,
                account,
                MaxUint128,
                0,
              ]),
            );
          }

          const estimatedGas = await farmingCenterContract.estimateGas.multicall(
            callDatas,
          );

          result = await farmingCenterContract.multicall(callDatas, {
            gasLimit: calculateGasMargin(estimatedGas),
          });
        }

        addTransaction(result, {
          summary: t('undepositNFT', { nftID: token }),
          type: TransactionType.UNDEPOSIT_NFT,
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  //collect rewards and claim than
  const eternalCollectRewardHandler = useCallback(
    async (
      token: any,
      {
        pool,
        eternalRewardToken,
        eternalBonusRewardToken,
        eternalStartTime,
        eternalEndTime,
      }: any,
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
              eternalRewardToken.address,
              eternalBonusRewardToken.address,
              pool.id,
              +eternalStartTime,
              +eternalEndTime,
            ],
            +token,
          ],
        );
        const claimReward1 = farmingCenterInterface.encodeFunctionData(
          'claimReward',
          [eternalRewardToken.address, account, 0, MaxUint128],
        );
        const claimReward2 = farmingCenterInterface.encodeFunctionData(
          'claimReward',
          [eternalBonusRewardToken.address, account, 0, MaxUint128],
        );

        let result: TransactionResponse;

        if (
          eternalRewardToken.address.toLowerCase() !==
          eternalBonusRewardToken.address.toLowerCase()
        ) {
          const estimatedGas = await farmingCenterContract.estimateGas.multicall(
            [collectRewards, claimReward1, claimReward2],
          );
          result = await farmingCenterContract.multicall(
            [collectRewards, claimReward1, claimReward2],
            { gasLimit: calculateGasMargin(estimatedGas) },
          );
        } else {
          const estimatedGas = await farmingCenterContract.estimateGas.multicall(
            [collectRewards, claimReward1],
          );
          result = await farmingCenterContract.multicall(
            [collectRewards, claimReward1],
            { gasLimit: calculateGasMargin(estimatedGas) },
          );
        }

        addTransaction(result, {
          summary: t('claimingReward'),
          type: TransactionType.CLAIMED_REWARDS,
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  const withdrawHandler = useCallback(
    async (token: any) => {
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

        const estimatedGas = await farmingCenterContract.estimateGas.withdrawToken(
          token,
          account,
          0x0,
        );

        const result = await farmingCenterContract.withdrawToken(
          token,
          account,
          0x0,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );

        addTransaction(result, {
          summary: t('withdrawingNFT', { nftID: token }) + '!',
          type: TransactionType.RECEIVED,
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  const farmHandler = useCallback(
    async (
      selectedNFT: any,
      { rewardToken, bonusRewardToken, pool, startTime, endTime }: any,
      eventType: any,
      selectedTier: any,
    ) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: selectedNFT,
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

        current = selectedNFT;

        const estimatedGas = await farmingCenterContract.estimateGas.enterFarming(
          [rewardToken, bonusRewardToken, pool, startTime, endTime],
          +selectedNFT,
          selectedTier,
          eventType === FarmingType.LIMIT,
        );

        const result = await farmingCenterContract.enterFarming(
          [rewardToken, bonusRewardToken, pool, startTime, endTime],
          +selectedNFT,
          selectedTier,
          eventType === FarmingType.LIMIT,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );

        addTransaction(result, {
          summary: `${t('nftDepositing', { nftID: selectedNFT })}!`,
          type: TransactionType.DEPOSIT_NFT,
        });

        updateV3Stake({ txHash: result.hash });

        const receipt = await result.wait();

        finalizeTransaction(receipt, {
          summary: `${t('nftDeposited', { nftID: selectedNFT })}!`,
        });

        updateV3Stake({ txConfirmed: true });
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  const approveHandler = useCallback(
    async (selectedNFT: any) => {
      if (!account || !provider || !chainId) return;

      updateV3Stake({
        selectedTokenId: selectedNFT,
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
          current = selectedNFT;

          const transferData = nonFunPosManInterface.encodeFunctionData(
            'safeTransferFrom(address,address,uint256)',
            [account, FARMING_CENTER[chainId], selectedNFT],
          );

          const estimatedGas = await nonFunPosManContract.estimateGas.multicall(
            [transferData],
          );

          const result = await nonFunPosManContract.multicall([transferData], {
            gasLimit: calculateGasMargin(estimatedGas),
          });

          addTransaction(result, {
            summary: `${t('nftApproving', { nftID: selectedNFT })}!`,
            type: TransactionType.APPROVED,
          });

          updateV3Stake({ txHash: result.hash });

          const receipt = await result.wait();

          finalizeTransaction(receipt, {
            summary: `${t('nftApproved', { nftID: selectedNFT })}!`,
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  const eternalOnlyCollectRewardHandler = useCallback(
    async (rewardToken: any) => {
      if (!account || !provider || !chainId) return;

      const farmingCenterContract = new Contract(
        FARMING_CENTER[chainId],
        FARMING_CENTER_ABI,
        provider.getSigner(),
      );

      updateV3Stake({
        selectedTokenId: rewardToken.id,
        selectedFarmingType: null,
        txType: 'eternalOnlyCollectReward',
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

        const result: TransactionResponse = await farmingCenterContract.claimReward(
          rewardToken.rewardAddress,
          account,
          MaxUint128,
          MaxUint128,
        );

        addTransaction(result, {
          summary: t('claimingReward'),
          type: TransactionType.CLAIMED_REWARDS,
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
      provider,
      updateV3Stake,
      t,
    ],
  );

  //   const claimReward = useCallback(async (tokenReward) => {
  //     try {
  //         if (!account || !provider || !chainId) return

  //         const farmingCenterContract = new Contract(
  //             FARMING_CENTER[chainId],
  //             FARMING_CENTER_ABI,
  //             provider.getSigner()
  //         )

  //         const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)))

  //         const result: TransactionResponse = await farmingCenterContract.claimReward(tokenReward, account, MaxUint128, MaxUint128)

  //         setClaimHash({ hash: result.hash, id: tokenReward })
  //         addTransaction(result, {
  //             summary: t`Claiming reward`
  //         })
  //     } catch (e) {
  //         setClaimHash('failed')
  //         if (e instanceof Error) {
  //             throw new Error('Claim rewards ' + e.message)
  //         }

  //     }
  // }, [account, chainId])

  return {
    approveHandler,
    farmHandler,
    withdrawHandler,
    claimRewardsHandler,
    eternalCollectRewardHandler,
    eternalOnlyCollectRewardHandler,
  };
}
