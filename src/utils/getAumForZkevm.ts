import { ethers } from 'ethers';
import { RPC_PROVIDERS } from 'constants/providers';
import { getQlpManager } from 'config';
import { formatCompact } from 'utils';

const POLYGON_ZKEVM = 1101;
const USD_DECIMALS = 30;

const DEFAULT_CHAIN_ID = POLYGON_ZKEVM;
interface ContractMap {
  [chainId: number]: {
    [contractName: string]: string;
  };
}
const CONTRACTS: ContractMap = {
  1101: {
    Vault: '0x99B31498B0a1Dae01fc3433e3Cb60F095340935C',
    Router: '0x1FE9fBA5955Af58C18057213F0151BBE893aB2c8',
    VaultReader: '0x8A8EAFB33011E912952F484E1640f9571dE7C163',
    Reader: '0xf1CFB75854DE535475B88Bb6FBad317eea98c0F9',
    QlpManager: '0x87BcD3914eD3dcd5886BA1c0f0DA25150b56fE54',
    RewardRouter: '0x4141b44f0e8b53aDcAc97D87a3c524d70e5e23B7',
    RewardReader: '0x5f24Aa47Cd5E9d5BbFDd693F6eFc661C5A6fC7dA',
    QLP: '0xC8E48fD037D1C4232F294b635E74d33A0573265a',
    USDQ: '0x48aC594dd00c4aAcF40f83337fc6dA31F9F439A7',
    OldStakedQlpTracker: '0x42d36bA59E1d3DCc96365948Df794e0054e5Fd4d',
    StakedQlpTracker: '0xd3Ee28CB8ed02a5641DFA02624dF399b01f1e131',
    OldFeeQlpTracker: '0x4f9e9A2eDc0471b6d52634995F827B6678BFb4BD',
    FeeQlpTracker: '0xd3Ee28CB8ed02a5641DFA02624dF399b01f1e131',
    FeeQlpDistributor: '0xe6700443149490a784415B682A4772Cc42714b53',
    StakedQlpDistributor: '0xDB1B5D7622b7E6a9E4fBD7658d1D5994174dcDcc',
    OrderBook: '0x7e01238227213C513010F5fAbD0634fEBee93EE5',
    OrderExecutor: '0x0cdda294315412B1Ba25AeE84EdD1d2bB67a0076',
    OrderBookReader: '0x0cdda294315412B1Ba25AeE84EdD1d2bB67a0076',
    PositionRouter: '0x443Cf165B72e4b4331C0101A10553269972Ed4B8',
    ReferralStorage: '0xD0357bae72A794A92c321C78A40a106d503527Be',
    ReferralReader: '0x29B3e948CE2Db1964006ea9f5eA072CE7D008a63',
    NATIVE_TOKEN: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    QUICK: '0x68286607A1d43602d880D349187c3c48c0fD05E6',
  },
};

const getZkevmContractAddress = (name: string) => {
  if (!CONTRACTS[POLYGON_ZKEVM][name]) {
    throw new Error(`Unknown constant "${name}" for chainId ${POLYGON_ZKEVM}`);
  }
  return CONTRACTS[POLYGON_ZKEVM][name];
};

export const getAumForZkevm = (): Promise<string | undefined> => {
  const provider = RPC_PROVIDERS[POLYGON_ZKEVM];
  const contrctInfo = getQlpManager();
  const qlpAddress = getZkevmContractAddress('QlpManager');
  const methodName = 'getAums';

  const contractCall: Promise<any> = getContractCall(
    provider,
    contrctInfo,
    qlpAddress,
    methodName,
    methodName,
  );
  return new Promise<string | undefined>(async (resolve, reject) => {
    contractCall
      .then((result) => {
        if (result && result.length > 0) {
          const calculatedValue = result[0].add(result[1]).div(2);
          const formattedValue = formatAmount(
            calculatedValue,
            USD_DECIMALS,
            4,
            false,
          );
          const compactValue = formatCompact(formattedValue, 18, 3, 3);
          return resolve(compactValue);
        } else {
          return resolve(undefined);
        }
      })
      .catch((error) => {
        console.log('Error => ', error);
        return reject(error);
      });
  });
};

const limitDecimals = (amount: any, maxDecimals: any) => {
  let amountStr = amount.toString();
  if (maxDecimals === undefined) {
    return amountStr;
  }
  if (maxDecimals === 0) {
    return amountStr.split('.')[0];
  }
  const dotIndex = amountStr.indexOf('.');
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1;
    if (decimals > maxDecimals) {
      amountStr = amountStr.substr(
        0,
        amountStr.length - (decimals - maxDecimals),
      );
    }
  }
  return amountStr;
};

const padDecimals = (amount: any, minDecimals: any) => {
  let amountStr = amount.toString();
  const dotIndex = amountStr.indexOf('.');
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1;
    if (decimals < minDecimals) {
      amountStr = amountStr.padEnd(
        amountStr.length + (minDecimals - decimals),
        '0',
      );
    }
  } else {
    amountStr = amountStr + '.0000';
  }
  return amountStr;
};

function numberWithCommas(x: any) {
  if (!x) {
    return '...';
  }
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

const formatAmount = (
  amount: any,
  tokenDecimals: any,
  displayDecimals: any,
  useCommas: any,
  defaultValue?: any,
) => {
  try {
    if (!defaultValue) {
      defaultValue = '...';
    }
    if (amount === undefined || amount.toString().length === 0) {
      return defaultValue;
    }
    if (displayDecimals === undefined) {
      displayDecimals = 4;
    }
    let amountStr = ethers.utils.formatUnits(amount, tokenDecimals);
    amountStr = limitDecimals(amountStr, displayDecimals);
    if (displayDecimals !== 0) {
      amountStr = padDecimals(amountStr, displayDecimals);
    }
    if (useCommas) {
      return numberWithCommas(amountStr);
    }
    return amountStr;
  } catch (error) {
    // console.log("Error on formatAmount", amount);
  }
};

const getContractCall = (
  provider: any,
  contractInfo: Record<any, any>,
  arg0: string,
  arg1: string,
  method: string,
  params: Array<any> = [],
  additionalArgs = undefined,
) => {
  if (ethers.utils.isAddress(arg0)) {
    const address = arg0;
    const contract = new ethers.Contract(address, contractInfo.abi, provider);

    if (additionalArgs) {
      return contract[method](...params.concat(additionalArgs));
    }
    return contract[method](...params);
  }

  if (!provider) {
    return;
  }

  return provider[method](arg1, ...params);
};
