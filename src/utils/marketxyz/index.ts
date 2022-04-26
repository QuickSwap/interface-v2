import { Comptroller, MarketSDK } from 'market-sdk';
import { BN } from 'utils/bigUtils';
import { USDPricedPoolAsset } from './fetchPoolData';
import { ETH_TOKEN_DATA } from './fetchTokenData';
import ERC20_ABI from '../../constants/abis/erc20.json';

export const BlocksPerMin = 60 / 2;
export const BlocksPerDay = BlocksPerMin * 60 * 24;

export const convertMantissaToAPY = (mantissa: any, dayRange: number) => {
  return (Math.pow((mantissa / 1e18) * BlocksPerDay + 1, dayRange) - 1) * 100;
};

export const convertMantissaToAPR = (mantissa: any) => {
  return (mantissa * BlocksPerDay * 365) / 1e16;
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
    Number(amount * 10 ** asset.underlyingDecimals.toNumber()).toFixed(0),
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
    await cToken.mint(amountBN, { from: address });
  }
  if (enableAsCollateral) {
    comptroller.enterMarkets([asset.cToken], { from: address });
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

  const isRepayingMax = amountBN.eq(asset.borrowBalance) && !isETH;

  const max = sdk.web3.utils
    .toBN(2)
    .pow(sdk.web3.utils.toBN(256))
    .sub(sdk.web3.utils.toBN(1));

  if (!isETH) {
    await checkAndApproveCToken(asset, amountBN, address);
    await cToken.repayBorrow(isRepayingMax ? max : amountBN, { from: address });

    return;
  }
  const ethBalance = await sdk.web3.eth.getBalance(address);

  if (amountBN.toString() === ethBalance.toString()) {
    const call = (cToken.contract.methods.repayBorrow as any)();

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
    await (cToken.repayBorrow as any)({ from: address, value: amountBN });
  }
};

export const toggleCollateral = (
  asset: USDPricedPoolAsset,
  comptroller: Comptroller,
  address: string,
) => {
  if (!asset.membership) {
    return comptroller.enterMarkets([asset.cToken.address], { from: address });
  } else {
    return comptroller.exitMarket(asset.cToken.address, { from: address });
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
  return cToken.redeemUnderlying(amountBN, { from: address });
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
  return cToken.borrow(amountBN, { from: address });
};
