import { Interface } from '@ethersproject/abi';
import stakingRewards from '@uniswap/liquidity-staker/build/StakingRewards.json';
import stakingRewardsFactory from '@uniswap/liquidity-staker/build/StakingRewardsFactory.json';
import stakingDualRewards from './dual-rewards.-staking.json';

const STAKING_REWARDS_ABI = stakingRewards.abi;
const STAKING_REWARDS_FACTORY_ABI = stakingRewardsFactory.abi;
const STAKING_DUAL_REWARDS_ABI = stakingDualRewards.abi;

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI);

const STAKING_REWARDS_FACTORY_INTERFACE = new Interface(
  STAKING_REWARDS_FACTORY_ABI,
);

const STAKING_DUAL_REWARDS_INTERFACE = new Interface(STAKING_DUAL_REWARDS_ABI);

export {
  STAKING_REWARDS_FACTORY_INTERFACE,
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
};
