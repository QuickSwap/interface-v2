import ethereum from './ethereum.json';
import polygon from './polygon.json';
import dogechain from './dogechain.json';
import zktestnet from './zktestnet.json';
import zkmainnet from './zkmainnet.json';
import manta from './manta.json';
import zkartana from './zkartana.json';
import tIMX from './tIMX.json';
import qlpmanager from './qlpmanager.json';
import x1 from './x1.json';
import IMX from './imx.json';
import astarZkevm from './astarzkevm.json';
import layerX from './layerx.json';
import minato from './minato.json';
import orderlyFeeTiers from './orderlyFeeTiers.json';
import { ChainId } from '@uniswap/sdk';

const configs: any = {
  [ChainId.ETHEREUM]: ethereum,
  [ChainId.MATIC]: polygon,
  [ChainId.DOGECHAIN]: dogechain,
  [ChainId.ZKTESTNET]: zktestnet,
  [ChainId.ZKEVM]: zkmainnet,
  [ChainId.MANTA]: manta,
  [ChainId.ZKATANA]: zkartana,
  [ChainId.TIMX]: tIMX,
  [ChainId.X1]: x1,
  [ChainId.IMX]: IMX,
  [ChainId.ASTARZKEVM]: astarZkevm,
  [ChainId.LAYERX]: layerX,
  [ChainId.MINATO]: minato,
};

export const getConfig = (network: ChainId | undefined) => {
  if (network === undefined) {
    return configs[ChainId.MATIC];
  }
  const config = configs[network];
  return config;
};

export const getQlpManager = () => {
  return qlpmanager;
};

export const getOrderlyFeeTiers = () => {
  return orderlyFeeTiers;
};

export const AML_SCORE_THRESHOLD = 7;
