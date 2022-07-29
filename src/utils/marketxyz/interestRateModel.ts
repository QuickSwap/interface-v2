import { MarketSDK } from 'market-sdk';
import { BN } from 'utils/bigUtils';
import { USDPricedPoolAsset } from './fetchPoolData';
import JumpRateModelArtifact from 'market-sdk/dist/abi/JumpRateModel.json';
import { getDaysCurrentYear } from 'utils';
import { GlobalValue } from 'constants/index';

export default class JumpRateModel {
  sdk: MarketSDK;
  asset: USDPricedPoolAsset;
  initialized = false;

  baseRatePerBlock?: BN;
  multiplierPerBlock?: BN;
  jumpMultiplierPerBlock?: BN;
  kink?: BN;

  reserveFactorMantissa?: BN;

  constructor(sdk: MarketSDK, asset: USDPricedPoolAsset) {
    this.sdk = sdk;
    this.asset = asset;
  }
  async init() {
    const jrmAddress = await this.asset.cToken.interestRateModel();
    const jrm = new this.sdk.web3.eth.Contract(
      JumpRateModelArtifact.abi as any,
      jrmAddress,
    );

    this.baseRatePerBlock = this.sdk.web3.utils.toBN(
      await jrm.methods.baseRatePerBlock().call(),
    );
    this.multiplierPerBlock = this.sdk.web3.utils.toBN(
      await jrm.methods.multiplierPerBlock().call(),
    );
    this.jumpMultiplierPerBlock = this.sdk.web3.utils.toBN(
      await jrm.methods.jumpMultiplierPerBlock().call(),
    );
    this.kink = this.sdk.web3.utils.toBN(await jrm.methods.kink().call());

    this.reserveFactorMantissa = this.sdk.web3.utils.toBN(
      await this.asset.cToken.reserveFactorMantissa(),
    );
    this.reserveFactorMantissa.iadd(
      this.sdk.web3.utils.toBN(await this.asset.cToken.adminFeeMantissa()),
    );
    this.reserveFactorMantissa.iadd(
      this.sdk.web3.utils.toBN(await this.asset.cToken.fuseFeeMantissa()),
    );
    this.initialized = true;
  }

  getBorrowRate(utilizationRate: BN) {
    if (!this.initialized)
      throw new Error('Interest rate model class not initialized.');

    const zeroBN = this.sdk.web3.utils.toBN(0);

    if (utilizationRate.lte(this.kink ?? zeroBN)) {
      return utilizationRate
        .mul(this.multiplierPerBlock ?? zeroBN)
        .div(this.sdk.web3.utils.toBN(1e18))
        .add(this.baseRatePerBlock ?? zeroBN);
    } else {
      const normalRate = (this.kink ?? zeroBN)
        .mul(this.multiplierPerBlock ?? zeroBN)
        .div(this.sdk.web3.utils.toBN(1e18))
        .add(this.baseRatePerBlock ?? zeroBN);
      const excessUtil = utilizationRate.sub(this.kink ?? zeroBN);

      return excessUtil
        .mul(this.jumpMultiplierPerBlock ?? zeroBN)
        .div(this.sdk.web3.utils.toBN(1e18))
        .add(normalRate);
    }
  }

  getSupplyRate(utilizationRate: BN) {
    if (!this.initialized)
      throw new Error('Interest rate model class not initialized.');

    const zeroBN = this.sdk.web3.utils.toBN(0);

    const oneMinusReserveFactor = this.sdk.web3.utils
      .toBN(1e18)
      .sub(this.reserveFactorMantissa ?? zeroBN);
    const borrowRate = this.getBorrowRate(utilizationRate);

    const rateToPool = borrowRate
      .mul(oneMinusReserveFactor)
      .div(this.sdk.web3.utils.toBN(1e18));

    return utilizationRate.mul(rateToPool).div(this.sdk.web3.utils.toBN(1e18));
  }

  convertIRMtoCurve() {
    const borrowerRates: { x: number; y: number }[] = [];
    const supplierRates: { x: number; y: number }[] = [];

    for (let i = 0; i <= 100; i++) {
      const supplyLevel =
        (Math.pow(
          (Number(
            this.getSupplyRate(
              this.sdk.web3.utils.toBN((i * 1e16).toString()),
            ).toString(),
          ) /
            1e18) *
            GlobalValue.marketSDK.BLOCKSPERDAY +
            1,
          getDaysCurrentYear(),
        ) -
          1) *
        100;

      const borrowLevel =
        (Math.pow(
          (Number(
            this.getBorrowRate(
              this.sdk.web3.utils.toBN((i * 1e16).toString()),
            ).toString(),
          ) /
            1e18) *
            GlobalValue.marketSDK.BLOCKSPERDAY +
            1,
          getDaysCurrentYear(),
        ) -
          1) *
        100;

      supplierRates.push({ x: i, y: supplyLevel });
      borrowerRates.push({ x: i, y: borrowLevel });
    }

    return { borrowerRates, supplierRates };
  }
}
