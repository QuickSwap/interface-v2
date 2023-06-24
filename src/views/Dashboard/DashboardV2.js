import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import TooltipComponent from "../../components/Tooltip/Tooltip";
import hexToRgba from "hex-to-rgba";
import { ethers } from "ethers";
import { getImageUrl } from "../../cloudinary/getImageUrl";
import { getWhitelistedTokens } from "../../data/Tokens";
import { getFeeHistory } from "../../data/Fees";
import qlp40Icon from "../../assets/icons/qlpCoin.svg";

import {
  fetcher,
  formatAmount,
  formatKeyAmount,
  expandDecimals,
  bigNumberify,
  numberWithCommas,
  getServerUrl,
  getChainName,
  useChainId,
  USD_DECIMALS,
  QPXQLP_DISPLAY_DECIMALS,
  QLP_DECIMALS,
  BASIS_POINTS_DIVISOR,
  POLYGON_ZKEVM,
  QLPPOOLCOLORS,
  getPageTitle,
} from "../../Helpers";
import { useInfoTokens } from "../../Api";
import { getContract } from "../../Addresses";

import Vault from "../../abis/Vault.json";
import Reader from "../../abis/Reader.json";
import QlpManager from "../../abis/QlpManager.json";
import Footer from "../../Footer";

import "./DashboardV2.css";

import maticIcon from "../../img/ic_polygon_16.svg";
import AssetDropdown from "./AssetDropdown";
import SEO from "../../components/Common/SEO";

import { useTotalVolume, useHourlyVolume, useTotalFees } from "../../Api";

const { AddressZero } = ethers.constants;

function getCurrentFeesUsd(tokenAddresses, fees, infoTokens) {
  if (!fees || !infoTokens) {
    return bigNumberify(0);
  }

  let currentFeesUsd = bigNumberify(0);
  for (let i = 0; i < tokenAddresses.length; i++) {
    const tokenAddress = tokenAddresses[i];
    const tokenInfo = infoTokens[tokenAddress];
    if (!tokenInfo || !tokenInfo.contractMinPrice) {
      continue;
    }

    const feeUsd = fees[i].mul(tokenInfo.contractMinPrice).div(expandDecimals(1, tokenInfo.decimals));
    currentFeesUsd = currentFeesUsd.add(feeUsd);
  }

  return currentFeesUsd;
}

export default function DashboardV2() {
  const { active, library } = useWeb3React();
  const { chainId } = useChainId();

  const chainName = getChainName(chainId);

  const positionStatsUrl = getServerUrl(chainId, "/position_stats");
  const { data: positionStats } = useSWR([positionStatsUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  const volumeInfo = useHourlyVolume();

  // const hourlyVolumeUrl = getServerUrl(chainId, "/hourly_volume");
  // const { data: hourlyVolume } = useSWR([hourlyVolumeUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  const totalVolumeSum = useTotalVolume();

  // const totalVolumeUrl = getServerUrl(chainId, "/total_volume");
  // const { data: totalVolume } = useSWR([totalVolumeUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // const totalVolumeSum = getTotalVolumeSum(totalVolume);

  const totalFees = useTotalFees();

  let totalLongPositionSizes;
  let totalShortPositionSizes;
  if (positionStats && positionStats.totalLongPositionSizes && positionStats.totalShortPositionSizes) {
    totalLongPositionSizes = bigNumberify(positionStats.totalLongPositionSizes);
    totalShortPositionSizes = bigNumberify(positionStats.totalShortPositionSizes);
  }

  //const volumeInfo = getVolumeInfo(hourlyVolume);

  const whitelistedTokens = getWhitelistedTokens(chainId);
  const whitelistedTokenAddresses = whitelistedTokens.map((token) => token.address);
  const tokenList = whitelistedTokens.filter((t) => !t.isWrapped);

  const readerAddress = getContract(chainId, "Reader");
  const vaultAddress = getContract(chainId, "Vault");
  const qlpManagerAddress = getContract(chainId, "QlpManager");

  const qlpAddress = getContract(chainId, "QLP");
  const usdqAddress = getContract(chainId, "USDQ");

  const tokensForSupplyQuery = [qlpAddress, usdqAddress];

  const { data: aums } = useSWR([`Dashboard:getAums:${active}`, chainId, qlpManagerAddress, "getAums"], {
      dedupingInterval: 20000,
      fetcher: fetcher(library, QlpManager),
  });

  const { data: fees } = useSWR([`Dashboard:fees:${active}`, chainId, readerAddress, "getFees", vaultAddress], {
      dedupingInterval: 30000,
      fetcher: fetcher(library, Reader, [whitelistedTokenAddresses]),
  });

  const { data: totalSupplies } = useSWR(
    [`Dashboard:totalSupplies:${active}`, chainId, readerAddress, "getTokenBalancesWithSupplies", AddressZero],
    {
      dedupingInterval: 30000,
      fetcher: fetcher(library, Reader, [tokensForSupplyQuery]),
    }
  );

  const { data: totalTokenWeights } = useSWR(
    [`QlpSwap:totalTokenWeights:${active}`, chainId, vaultAddress, "totalTokenWeights"],
    {
      dedupingInterval: 30000,
      fetcher: fetcher(library, Vault),
    }
  );

  const { infoTokens } = useInfoTokens(library, chainId, active, undefined, undefined);

  const currentFeesUsd = getCurrentFeesUsd(whitelistedTokenAddresses, fees, infoTokens);

  const feeHistory = getFeeHistory(chainId);
  // const shouldIncludeCurrrentFees = feeHistory.length && parseInt(Date.now() / 1000) - feeHistory[0].to > 60 * 60;
  const shouldIncludeCurrrentFees = true;
  let totalFeesDistributed = shouldIncludeCurrrentFees
    ? parseFloat(bigNumberify(formatAmount(currentFeesUsd, USD_DECIMALS - 2, 0, false)).toNumber()) / 100
    : 0;
  for (let i = 0; i < feeHistory.length; i++) {
    totalFeesDistributed += parseFloat(feeHistory[i].feeUsd);
  }

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  let qlpPrice;
  let qlpSupply;
  let qlpMarketCap;
  if (aum && totalSupplies && totalSupplies[1]) {
    
    qlpSupply = totalSupplies[1];
    qlpPrice =
      aum && aum.gt(0) && qlpSupply.gt(0)
        ? aum.mul(expandDecimals(1, QLP_DECIMALS)).div(qlpSupply)
        : expandDecimals(1, USD_DECIMALS);

    qlpMarketCap = qlpPrice.mul(qlpSupply).div(expandDecimals(1, QLP_DECIMALS));
  }

  let tvl;
  if (qlpMarketCap) {
    tvl = qlpMarketCap;
  }

  let adjustedUsdqSupply = bigNumberify(0);

  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i];
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo && tokenInfo.usdqAmount) {
      adjustedUsdqSupply = adjustedUsdqSupply.add(tokenInfo.usdqAmount);
    }
  }

  const getWeightText = (tokenInfo) => {
    if (
      !tokenInfo.weight ||
      !tokenInfo.usdqAmount ||
      !adjustedUsdqSupply ||
      adjustedUsdqSupply.eq(0) ||
      !totalTokenWeights
    ) {
      return "...";
    }

    const currentWeightBps = tokenInfo.usdqAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdqSupply);
    const targetWeightBps = tokenInfo.weight.mul(BASIS_POINTS_DIVISOR).div(totalTokenWeights);

    const weightText = `${formatAmount(currentWeightBps, 2, 2, false)}% / ${formatAmount(
      targetWeightBps,
      2,
      2,
      false
    )}%`;

    return (
      <TooltipComponent
        handle={weightText}
        position="right-bottom"
        renderContent={() => {
          return (
            <>
              Current Weight: {formatAmount(currentWeightBps, 2, 2, false)}%<br />
              Target Weight: {formatAmount(targetWeightBps, 2, 2, false)}%<br />
              <br />
              {currentWeightBps.lt(targetWeightBps) && (
                <div>
                  {tokenInfo.symbol} is below its target weight.
                  <br />
                  <br />
                  Get lower fees to{" "}
                  <Link to="/liquidity" target="_blank" rel="noopener noreferrer">
                    + liq.
                  </Link>{" "}
                  with {tokenInfo.symbol},&nbsp; and to{" "}
                  <Link to="/trade" target="_blank" rel="noopener noreferrer">
                    swap
                  </Link>{" "}
                  {tokenInfo.symbol} for other tokens.
                </div>
              )}
              {currentWeightBps.gt(targetWeightBps) && (
                <div>
                  {tokenInfo.symbol} is above its target weight.
                  <br />
                  <br />
                  Get lower fees to{" "}
                  <Link to="/trade" target="_blank" rel="noopener noreferrer">
                    swap
                  </Link>{" "}
                  tokens for {tokenInfo.symbol}.
                </div>
              )}
              <br />
              <div>
                <a href="https://perps-docs.quickswap.exchange/qlp" target="_blank" rel="noopener noreferrer">
                  More Info
                </a>
              </div>
            </>
          );
        }}
      />
    );
  };

  const totalStatsStartDate = "12 May 2023";

  let stableQlp = 0;
  let totalQlp = 0;

  let qlpPool = tokenList.map((token) => {
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo.usdqAmount && adjustedUsdqSupply && adjustedUsdqSupply > 0) {
      const currentWeightBps = tokenInfo.usdqAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdqSupply);
      if (tokenInfo.isStable) {
        stableQlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      }
      totalQlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      return {
        fullname: token.name,
        name: token.symbol,
        value: parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`),
      };
    }
    return null;
  });

  let stablePercentage = totalQlp > 0 ? ((stableQlp * 100) / totalQlp).toFixed(2) : "0.0";

  qlpPool = qlpPool.filter(function (element) {
    return element !== null;
  });

  qlpPool = qlpPool.sort(function (a, b) {
    if (a.value < b.value) return 1;
    else return -1;
  });

  const [qlpActiveIndex, setQLPActiveIndex] = useState(null);

  const onQLPPoolChartEnter = (_, index) => {
    setQLPActiveIndex(index);
  };

  const onQLPPoolChartLeave = (_, index) => {
    setQLPActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="stats-label">
          <div className="stats-label-color" style={{ backgroundColor: payload[0].color }}></div>
          {payload[0].name}: {payload[0].value}%
        </div>
      );
    }

    return null;
  };

  return (
    <SEO title={getPageTitle("Dashboard")}>
      <div className="default-container DashboardV2 page-layout">
        <div className="section-title-block2 mb-3 sectionsmallscreen">
          <div className="section-title-icon section-title-iconsmall">
            <img
              style={{ width: "80px" }}
              src={getImageUrl({
                path: "illustration/statsIcon",
                format: "png",
              })}
              alt="StatsIcon"
            />
          </div>
          <div className="section-title-content">
            <div className="Page-title">Dashboard</div>
            <div className="Page-description">
              {chainName} started on {totalStatsStartDate}.
              {/* <br /> In-depth statistics:{" "} */}
              {/* {chainId === POLYGON_ZKEVM && (
                <a
                  href="https://perps-analytics.quickswap.exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ahreftextcolor"
                >
                  https://perps-analytics.quickswap.exchange
                </a>
              )} */}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "40px" }} className="DashboardV2-content">
          <div className="DashboardV2-cards ">
            <div className="App-card">
              <div className="App-card-title">Total Stats</div>
              <div className="App-card-divider"></div>
              <div className="App-card-content">
                <div className="App-card-row padding-left">
                  <div className="label">Total Volume</div>
                  <div>${formatAmount(totalVolumeSum, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">24h Volume</div>
                  <div>${formatAmount(volumeInfo, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">Long Positions</div>
                  <div>${formatAmount(totalLongPositionSizes, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">Short Positions</div>
                  <div>${formatAmount(totalShortPositionSizes, USD_DECIMALS, 0, true)}</div>
                </div>
              </div>
            </div>
            <div className="App-card ">
              <div className="App-card-title">Overview</div>
              <div className="App-card-divider"></div>
              <div className="App-card-content">
                <div className="App-card-row padding-left">
                  <div className="label">AUM</div>
                  <div>
                    <TooltipComponent
                      handle={`$${formatAmount(tvl, USD_DECIMALS, 0, true)}`}
                      position="right-bottom"
                      renderContent={() => `Assets Under Management`}
                    />
                  </div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">QLP Pool</div>
                  <div>
                    {formatAmount(qlpSupply, 18, 0, true)} QLP (
                    <TooltipComponent
                      handle={`$${formatAmount(aum, USD_DECIMALS, 0, true)}`}
                      position="right-bottom"
                      renderContent={() => `Total value of tokens in QLP pool (${chainName})`}
                    />
                    )
                  </div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">Total collected fees</div>
                  <div>${formatAmount(totalFees, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row padding-left">
                  <div className="label">Collected fees from June 23, 2023</div>
                  <div>${numberWithCommas(totalFeesDistributed.toFixed(0))}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-title-block2  mt-5 mb-4 sectionsmallscreen">
            <div
              className="section-title-icon section-title-iconsmall"
              style={{
                width: 80,
                border: "4px solid #1B1E29",
                borderRadius: 20,
                height: 80,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                style={{ height: "40px" }}
                src={getImageUrl({
                  path: "illustration/TokensIcon",
                  format: "png",
                })}
                alt="Our Tokens"
              />
            </div>
            <div className="section-title-content">
              <div className="Page-title">Token</div>
              <div className="Page-description">QuickPerps Liquidity Token Index</div>
            </div>
          </div>

          <div className="DashboardV2-token-cards">
            <div className="stats-wrapper stats-wrapper--qpx" style={{ display: "block" }}>
              <div className="App-card">
                <div className="App-card-title">
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
                    className="App-card-title-mark"
                  >
                    {/* <div style={{ margin: 0 }} className="App-card-title-mark-icon">
                      <img
                        style={{ width: "60px", height: "60px", marginRight: "5px" }}
                        src={getImageUrl({
                          path: "coins/qlp-original",
                          format: "png",
                        })}
                        alt="QLP Token"
                      />
                    </div> */}
                    <div className="App-card-title-mark-icon">
                      <img style={{ width: 48, height: 48 }} src={qlp40Icon} alt="qlp40Icon" />
                    </div>
                    <div className="App-card-title-mark-info" style={{marginRight:"auto"}}>
                      <div className="App-card-title-mark-title">QLP</div>
                    </div>
                    <div>
                      {/* <AssetDropdown assetSymbol="QLP" /> */}

                      <TooltipComponent
                        handle={
                          <a
                            href="https://zkevm.polygonscan.com/address/0x99B31498B0a1Dae01fc3433e3Cb60F095340935C" //DONT FORGET
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src={maticIcon} style={{ width: 20, height: 20 }} alt="Proof of Reserves" />
                          </a>
                        }
                        position="right-top"
                        renderContent={() => `Proof of Reserves`}
                        className="proof-tooltip"
                      />
                    </div>
                  </div>
                </div>
                <div className="stats-block">
                  <div className="App-card-divider"></div>

                  <div className="App-card-content basis-chart">
                    <div className="App-card-row">
                      <div className="label">Price</div>
                      <div>${formatAmount(qlpPrice, USD_DECIMALS, QPXQLP_DISPLAY_DECIMALS, true)}</div>
                    </div>
                    <div className="App-card-row">
                      <div className="label">Supply</div>
                      <div>{formatAmount(qlpSupply, QLP_DECIMALS, 0, true)} QLP</div>
                    </div>
                    {/*     <div className="App-card-row">
                      <div className="label">Total Staked</div>
                      <div>${formatAmount(qlpMarketCap, USD_DECIMALS, 0, true)}</div>
                    </div> */}
                    <div className="App-card-row">
                      <div className="label">Market Cap</div>
                      <div>${formatAmount(qlpMarketCap, USD_DECIMALS, 0, true)}</div>
                    </div>
                    <div className="App-card-row">
                      <div className="label">Stablecoin Percentage</div>
                      <div>{stablePercentage}%</div>
                    </div>
                  </div>
                  <div className="stats-piechart" onMouseOut={onQLPPoolChartLeave}>
                    {qlpPool.length > 0 && (
                      <PieChart width={210} height={210}>
                        <Pie
                          data={qlpPool}
                          cx={100}
                          cy={100}
                          innerRadius={73}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          onMouseEnter={onQLPPoolChartEnter}
                          onMouseOut={onQLPPoolChartLeave}
                          onMouseLeave={onQLPPoolChartLeave}
                          paddingAngle={2}
                        >
                          {qlpPool.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={QLPPOOLCOLORS[entry.name]}
                              style={{
                                filter:
                                  qlpActiveIndex === index
                                    ? `drop-shadow(0px 0px 6px ${hexToRgba(QLPPOOLCOLORS[entry.name], 0.7)})`
                                    : "none",
                                cursor: "pointer",
                              }}
                              stroke={QLPPOOLCOLORS[entry.name]}
                              strokeWidth={qlpActiveIndex === index ? 1 : 1}
                            />
                          ))}
                        </Pie>
                        <text x={"50%"} y={"50%"} fill="white" textAnchor="middle" dominantBaseline="middle">
                          QLP Pool
                        </text>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="token-table-wrapper App-card">
              <div className="App-card-title">QuickPerps Liquidity Pool</div>
              <div className="App-card-divider"></div>
              <table className="token-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Price</th>
                    <th>Pool</th>
                    <th>Weight</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenList.map((token) => {
                    const tokenInfo = infoTokens[token.address];
                    let utilization = bigNumberify(0);
                    if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                      utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
                    }
                    const maxUsdqAmount = tokenInfo.maxUsdqAmount;

                    var tokenImage = null;

                    try {
                      tokenImage = getImageUrl({
                        path: `coins/others/${token.symbol.toLowerCase()}-original`,
                        format: "png",
                      });
                    } catch (error) {
                      console.error(error);
                    }

                    return (
                      <tr key={token.symbol}>
                        <td>
                          <div className="token-symbol-wrapper">
                            <div className="App-card-title-info">
                              <div className="App-card-title-info-icon">
                                <img
                                  style={{ objectFit: "contain" }}
                                  src={tokenImage}
                                  alt={token.symbol}
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="App-card-title-info-text">
                                <div
                                  style={{
                                    fontSize: "16px",
                                    letterSpacing: "-0.01em",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  className="App-card-info-title"
                                >
                                  {token.name}
                                  <div>
                                    <AssetDropdown assetSymbol={token.symbol} assetInfo={token} />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    lineHeight: "23px",
                                    color: "#696c80",
                                    display: "flex",
                                    alignItems: "center",

                                    gap: 13,
                                  }}
                                  className="App-card-info-subtitle"
                                >
                                  {token.symbol}
                                  {token.symbol === "BUSD" && (
                                    <span
                                      style={{
                                        background: "#ffaa27",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                        padding: "0 10px",
                                        color: "black",
                                        borderRadius: 30,
                                        userSelect: "none",
                                      }}
                                    >
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          ${formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, tokenInfo.displayDecimals, true)}
                        </td>
                        <td>
                          <TooltipComponent
                            handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 0, true)}`}
                            position="right-bottom"
                            renderContent={() => {
                              return (
                                <>
                                  Pool Amount: {formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 2, true)}{" "}
                                  {token.symbol}
                                  <br />
                                  <br />
                                  Target Min Amount:{" "}
                                  {formatKeyAmount(tokenInfo, "bufferAmount", token.decimals, 2, true)} {token.symbol}
                                  <br />
                                  <br />
                                  Max {tokenInfo.symbol} Capacity: ${formatAmount(maxUsdqAmount, 18, 0, true)}
                                </>
                              );
                            }}
                          />
                        </td>
                        <td>{getWeightText(tokenInfo)}</td>
                        <td>{formatAmount(utilization, 2, 2, false)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="token-grid">
              {tokenList.map((token) => {
                const tokenInfo = infoTokens[token.address];
                let utilization = bigNumberify(0);
                if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                  utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
                }
                const maxUsdqAmount = tokenInfo.maxUsdqAmount;
                var tokenImage = null;

                try {
                  tokenImage = getImageUrl({
                    path: `coins/others/${token.symbol.toLowerCase()}-original`,
                    format: "png",
                  });
                } catch (error) {
                  console.error(error);
                }

                return (
                  <div className="App-card" key={token.symbol}>
                    <div className="App-card-title">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img style={{ objectFit: "contain" }} src={tokenImage} alt={token.symbol} width="40px" />
                        <span className="mx-1">{token.symbol}</span>
                        <div className="">
                          <AssetDropdown assetSymbol={token.symbol} assetInfo={token} />
                        </div>
                      </div>
                    </div>
                    <div className="App-card-divider"></div>
                    <div className="App-card-content">
                      <div className="App-card-row">
                        <div className="label">Price</div>
                        <div>
                          ${formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, tokenInfo.displayDecimals, true)}
                        </div>
                      </div>
                      <div className="App-card-row">
                        <div className="label">Pool</div>
                        <div>
                          <TooltipComponent
                            handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 0, true)}`}
                            position="right-bottom"
                            renderContent={() => {
                              return (
                                <>
                                  Pool Amount: {formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 2, true)}{" "}
                                  {token.symbol}
                                  <br />
                                  <br />
                                  Max {tokenInfo.symbol} Capacity: ${formatAmount(maxUsdqAmount, 18, 0, true)}
                                </>
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div className="App-card-row">
                        <div className="label">Weight</div>
                        <div>{getWeightText(tokenInfo)}</div>
                      </div>
                      <div className="App-card-row">
                        <div className="label">Utilization</div>
                        <div>{formatAmount(utilization, 2, 2, false)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
