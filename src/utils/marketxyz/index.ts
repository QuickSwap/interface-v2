import { Comptroller, MarketSDK } from 'market-sdk';
import { Token, ChainId } from '@uniswap/sdk';
import { BN } from 'utils/bigUtils';
import { USDPricedPoolAsset } from './fetchPoolData';
import { ETH_TOKEN_DATA } from './fetchTokenData';
import { getDaysCurrentYear } from 'utils';
import ERC20_ABI from '../../constants/abis/erc20.json';
import {
  testForComptrollerErrorAndSend,
  testForCTokenErrorAndSend,
} from './errors';

export const BlocksPerMin = 60 / 2;
export const BlocksPerDay = BlocksPerMin * 60 * 24;

export const convertMantissaToAPY = (mantissa: any, dayRange: number) => {
  return (Math.pow((mantissa / 1e18) * BlocksPerDay + 1, dayRange) - 1) * 100;
};

export const convertMantissaToAPR = (mantissa: any) => {
  return (mantissa * BlocksPerDay * getDaysCurrentYear()) / 1e16;
};

export const getPoolAssetToken = (
  asset: USDPricedPoolAsset,
  chainId?: ChainId,
) => {
  return new Token(
    chainId ?? ChainId.MATIC,
    asset.underlyingToken,
    Number(asset.underlyingDecimals),
    asset.underlyingSymbol,
    asset.underlyingName,
  );
};

const fetchGasForCall = async (
  call: any,
  amountBN: BN,
  address: string,
  sdk: MarketSDK,
) => {
  const estimatedGas = sdk.web3.utils.toBN(
    (
      Number(
        (
          await call.estimateGas({
            from: address,
            // Cut amountBN in half in case it screws up the gas estimation by causing a fail in the event that it accounts for gasPrice > 0 which means there will not be enough ETH (after paying gas)
            value: amountBN.div(sdk.web3.utils.toBN(2)),
          })
        ).toString(),
      ) *
      // 50% more gas for limit:
      1.5
    ).toFixed(0),
  );

  // Ex: 100 (in GWEI)
  const { standard } = await fetch('https://gasprice.poa.network').then((res) =>
    res.json(),
  );
  const gasPrice = sdk.web3.utils.toWei(standard.toString(), 'gwei');
  const gasWEI = estimatedGas.mul(gasPrice);

  return { gasWEI, gasPrice, estimatedGas };
};

const checkAndApproveCToken = async (
  asset: USDPricedPoolAsset,
  amountBN: BN,
  address: string,
) => {
  const cToken = asset.cToken;
  const sdk = cToken.sdk;

  const underlyingContract = new sdk.web3.eth.Contract(
    ERC20_ABI as any,
    asset.underlyingToken,
  );

  const max = sdk.web3.utils
    .toBN(2)
    .pow(sdk.web3.utils.toBN(256))
    .sub(sdk.web3.utils.toBN(1));

  const hasApprovedEnough = sdk.web3.utils
    .toBN(
      await underlyingContract.methods
        .allowance(address, cToken.address)
        .call(),
    )
    .gte(amountBN);

  if (!hasApprovedEnough) {
    await underlyingContract.methods
      .approve(cToken.address, max)
      .send({ from: address });
  }
};

export const supply = async (
  asset: USDPricedPoolAsset,
  amount: number,
  address: string,
  enableAsCollateral: boolean,
) => {
  const cToken = asset.cToken;
  const sdk = cToken.sdk;

  const isETH = asset.underlyingToken === ETH_TOKEN_DATA.address;
  const amountBN = sdk.web3.utils.toBN(
    amount * 10 ** asset.underlyingDecimals.toNumber(),
  );

  const comptroller = new Comptroller(
    sdk,
    await asset.cToken.contract.methods.comptroller().call(),
  );

  if (isETH) {
    const ethBalance = await sdk.web3.eth.getBalance(address);

    if (amountBN.toString() === ethBalance.toString()) {
      const call = (cToken.contract.methods.mint as any)();

      // Subtract gas for max ETH
      const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
        call,
        amountBN,
        address,
        cToken.sdk,
      );

      await call.send({
        from: address,
        value: amountBN.sub(gasWEI),
        gasPrice,
        gas: estimatedGas,
      } as any);
    } else {
      await (cToken.mint as any)({ from: address, value: amountBN });
    }
  } else {
    await checkAndApproveCToken(asset, amountBN, address);
    await testForCTokenErrorAndSend(
      cToken.contract.methods.mint(amountBN),
      address,
      'Cannot deposit this amount right now!',
      sdk,
    );
  }
  if (enableAsCollateral) {
    await comptroller.enterMarkets([asset.cToken], { from: address });
  }
};

export const repayBorrow = async (
  asset: USDPricedPoolAsset,
  amount: number,
  address: string,
) => {
  const cToken = asset.cToken;
  const sdk = cToken.sdk;

  const isETH = asset.underlyingToken === ETH_TOKEN_DATA.address;
  const amountBN = sdk.web3.utils.toBN(
    Number(amount * 10 ** asset.underlyingDecimals.toNumber()).toFixed(0),
  );

  const isRepayingMax =
    amountBN.eq(sdk.web3.utils.toBN(asset.borrowBalance.toString())) && !isETH;

  const max = sdk.web3.utils
    .toBN(2)
    .pow(sdk.web3.utils.toBN(256))
    .sub(sdk.web3.utils.toBN(1));

  if (!isETH) {
    await checkAndApproveCToken(asset, amountBN, address);
    await testForCTokenErrorAndSend(
      cToken.contract.methods.repayBorrow(isRepayingMax ? max : amountBN),
      address,
      'Cannot repay this amount right now!',
      sdk,
    );

    return;
  }
  const ethBalance = await sdk.web3.eth.getBalance(address);
  const call = (cToken.contract.methods.repayBorrow as any)();

  if (amountBN.toString() === ethBalance.toString()) {
    // Subtract gas for max ETH
    const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(
      call,
      amountBN,
      address,
      cToken.sdk,
    );

    await call.send({
      from: address,
      value: amountBN.sub(gasWEI),

      gasPrice,
      gas: estimatedGas,
    } as any);
  } else {
    await call.send({
      from: address,
      value: amountBN,
    });
  }
};

export const toggleCollateral = (
  asset: USDPricedPoolAsset,
  comptroller: Comptroller,
  address: string,
) => {
  if (!asset.membership) {
    return testForComptrollerErrorAndSend(
      comptroller.contract.methods.enterMarkets([asset.cToken.address]),
      address,
      'Cannot enter this market right now!',
    );
  } else {
    return testForComptrollerErrorAndSend(
      comptroller.contract.methods.exitMarket(asset.cToken.address),
      address,
      'Cannot exit this market right now!',
    );
  }
};

export const withdraw = (
  asset: USDPricedPoolAsset,
  amount: number,
  address: string,
) => {
  const cToken = asset.cToken;
  const sdk = cToken.sdk;

  const amountBN = sdk.web3.utils.toBN(
    Number(amount * 10 ** asset.underlyingDecimals.toNumber()).toFixed(0),
  );
  return testForCTokenErrorAndSend(
    cToken.contract.methods.redeemUnderlying(amountBN),
    address,
    'Cannot withdraw this amount right now!',
    sdk,
  );
};

export const borrow = (
  asset: USDPricedPoolAsset,
  amount: number,
  address: string,
) => {
  const cToken = asset.cToken;
  const sdk = cToken.sdk;

  const amountBN = sdk.web3.utils.toBN(
    Number(amount * 10 ** asset.underlyingDecimals.toNumber()).toFixed(0),
  );

  return testForCTokenErrorAndSend(
    cToken.contract.methods.borrow(amountBN),
    address,
    'Cannot borrow this amount right now!',
    sdk,
  );
};
