import { WETH } from '@uniswap/sdk';
import { MetaToken } from './types';
import usdcABI from 'constants/abis/usdc.json';
import tokenABI from 'constants/abis/meta_token.json';
import quickABI from 'constants/abis/quick.json';
import sandABI from 'constants/abis/sand.json';
import { EIP712TypeOneApproveStrategy } from './approveStrategies/EIP712TypeOneApproveStrategy';
import { EIP712TypeTwoApproveStrategyFactory } from './approveStrategies/EIP712TypeTwoApproveStrategy';
import { PermitOnlyApproveStrategyFactory } from './approveStrategies/PermitOnlyApproveStrategy';
import { EIP2771ApproveStrategy } from './approveStrategies/EIP2771ApproveStrategy';
import { returnTokenFromKey } from '../../../utils';

const DAI = returnTokenFromKey('DAI');
const QUICK = returnTokenFromKey('QUICK');
const SAND = returnTokenFromKey('SAND');
const USDC = returnTokenFromKey('USDC');
const USDT = returnTokenFromKey('USDT');
const WBTC = returnTokenFromKey('WBTC');

const permitDomainTypeQuick = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];
const MetaUSDC = new MetaToken(USDC, usdcABI, EIP712TypeOneApproveStrategy);
//TODO //review
const MetaWETH = new MetaToken(
  WETH[137],
  tokenABI,
  EIP712TypeOneApproveStrategy,
);
const MetaUSDT = new MetaToken(USDT, tokenABI, EIP712TypeOneApproveStrategy);
const MetaWBTC = new MetaToken(WBTC, tokenABI, EIP712TypeOneApproveStrategy);
const MetaDAI = new MetaToken(DAI, tokenABI, EIP712TypeOneApproveStrategy);
const MetaQUICK = new MetaToken(
  QUICK,
  quickABI,
  PermitOnlyApproveStrategyFactory({
    //permitDomainData: { version: '1' },
    permitDomainType: permitDomainTypeQuick,
  }),
);
const MetaSAND = new MetaToken(SAND, sandABI, EIP2771ApproveStrategy);
export default [
  MetaUSDC,
  MetaWETH,
  MetaUSDT,
  MetaWBTC,
  MetaDAI,
  MetaQUICK,
  MetaSAND,
];
