import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import Modal from "../../components/Modal/Modal";
import Checkbox from "../../components/Checkbox/Checkbox";
import Vault from "../../abis/Vault.json";
import Reader from "../../abis/Reader.json";
import RewardRouter from "../../abis/RewardRouter.json";
import RewardReader from "../../abis/RewardReader.json";
import QlpManager from "../../abis/QlpManager.json";
import { ethers } from "ethers";
import {

    fetcher,
    formatAmount,
    formatKeyAmount,
    useLocalStorageSerializeKey,
    useChainId,
    USD_DECIMALS,
    PLACEHOLDER_ACCOUNT,
    getBalanceAndSupplyData,
    getDepositBalanceData,
    getStakingData,
    getProcessedData,

} from "../../Helpers";
import { callContract } from "../../Api";
import { getConstant } from "../../Constants";
import useSWR from "swr";
import { getContract } from "../../Addresses";
import "./Stake.css";

function CompoundModal(props) {
    const {
        isVisible,
        setIsVisible,
        rewardRouterAddress,
        library,
        chainId,
        setPendingTxns,
        wrappedTokenSymbol,
    } = props;
    const [isCompounding, setIsCompounding] = useState(false);

    const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
        [chainId, "Stake-compound-should-claim-weth"],
        true
    );
    const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
        [chainId, "Stake-compound-should-convert-weth"],
        true
    );

    const [shouldAddIntoQLP, setShouldAddIntoQLP] = useLocalStorageSerializeKey(
        [chainId, "Stake-compound-should-add-into-qlp"],
        true
    );

    const isPrimaryEnabled = () => {
        return !isCompounding;
    };

    const getPrimaryText = () => {

        if (isCompounding) {
            return "Compounding...";
        }
        return "Compound";
    };

    const onClickPrimary = () => {

        setIsCompounding(true);

        const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
        callContract(
            chainId,
            contract,

            "handleRewards",
            [
                shouldClaimWeth || shouldConvertWeth,
                shouldConvertWeth,
                shouldAddIntoQLP,
            ],
            {
                sentMsg: "Compound submitted!",
                failMsg: "Compound failed.",
                successMsg: "Compound completed!",
                setPendingTxns,
            }
        )
            .then(async (res) => {
                setIsVisible(false);
            })
            .finally(() => {
                setIsCompounding(false);
            });
    };

    const toggleClaimWeth = (value) => {
        if (!value) {
            setShouldClaimWeth(false);
            setShouldAddIntoQLP(false);
        }
        setShouldClaimWeth(value);
    };

    const toggleAddIntoQLP = (value) => {
        if (value) {
            setShouldClaimWeth(true);
            setShouldConvertWeth(false);
        }
        setShouldAddIntoQLP(value);
    };

    return (
        <div className="StakeModal">
            <Modal isVisible={isVisible} setIsVisible={setIsVisible} label="Compound Rewards">
                <div className="CompoundModal-menu">
                    <div>
                        <Checkbox isChecked={shouldClaimWeth} setIsChecked={toggleClaimWeth} disabled={shouldConvertWeth}>
                            <span style={{ marginLeft: 5 }}>Claim {wrappedTokenSymbol}</span>
                        </Checkbox>
                    </div>
                    <div>
                        <Checkbox isChecked={shouldAddIntoQLP} setIsChecked={toggleAddIntoQLP}>
                            <span style={{ marginLeft: 5 }}>Compound {wrappedTokenSymbol} into QLP</span>
                        </Checkbox>
                    </div>
                </div>
                <div className="Exchange-swap-button-container">
                    <button
                        className="App-cta Exchange-swap-button query-modal"
                        onClick={onClickPrimary}
                        disabled={!isPrimaryEnabled()}
                    >
                        {getPrimaryText()}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

function ClaimModal(props) {
    const {
        isVisible,
        setIsVisible,
        rewardRouterAddress,
        library,
        chainId,
        setPendingTxns,
        nativeTokenSymbol,
        wrappedTokenSymbol,
    } = props;
    const [isClaiming, setIsClaiming] = useState(false);

    const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
        [chainId, "Stake-claim-should-claim-weth"],
        true
    );
    const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
        [chainId, "Stake-claim-should-convert-weth"],
        true
    );

    const isPrimaryEnabled = () => {
        return !isClaiming;
    };

    const getPrimaryText = () => {
        if (isClaiming) {
            return `Claiming...`;
        }
        return "Claim";
    };

    const onClickPrimary = () => {
        setIsClaiming(true);

        const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
        callContract(
            chainId,
            contract,
            "handleRewards",
            [
                shouldClaimWeth,
                shouldConvertWeth,
                false,
            ],
            {
                sentMsg: "Claim submitted.",
                failMsg: "Claim failed.",
                successMsg: "Claim completed!",
                setPendingTxns,
            }
        )
            .then(async (res) => {
                setIsVisible(false);
            })
            .finally(() => {
                setIsClaiming(false);
            });
    };

    const toggleConvertWeth = (value) => {
        if (value) {
            setShouldClaimWeth(true);
        }
        setShouldConvertWeth(value);
    };

    return (
        <div className="StakeModal">
            <Modal isVisible={isVisible} setIsVisible={setIsVisible} label="Claim Rewards">
                <div className="CompoundModal-menu">
                    <div>
                        <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
                            <span style={{ marginLeft: 12 }}>Claim {wrappedTokenSymbol}</span>
                        </Checkbox>
                    </div>
                    <div>
                        <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
                            <span style={{ marginLeft: 12 }}>
                                Convert {wrappedTokenSymbol} into {nativeTokenSymbol}
                            </span>
                        </Checkbox>
                    </div>
                </div>
                <div className="Exchange-swap-button-container">
                    <button className="App-cta Exchange-swap-button query-modal" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
                        {getPrimaryText()}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default function Stake({ setPendingTxns, connectWallet }) {
    const { active, library, account } = useWeb3React();
    const { chainId } = useChainId();

    const hasInsurance = false;

    const [isCompoundModalVisible, setIsCompoundModalVisible] = useState(false);
    const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);

    const rewardRouterAddress = getContract(chainId, "RewardRouter");
    const rewardReaderAddress = getContract(chainId, "RewardReader");
    const readerAddress = getContract(chainId, "Reader");

    const vaultAddress = getContract(chainId, "Vault");
    const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");

    const qlpAddress = getContract(chainId, "QLP");

    const stakedQlpTrackerAddress = getContract(chainId, "StakedQlpTracker");
    const feeQlpTrackerAddress = getContract(chainId, "FeeQlpTracker");

    const qlpManagerAddress = getContract(chainId, "QlpManager");

    const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
    const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

    const walletTokens = [qlpAddress];
    const depositTokens = [
        qlpAddress,
    ];
    const rewardTrackersForDepositBalances = [
        feeQlpTrackerAddress,
    ];
    const rewardTrackersForStakingInfo = [
        stakedQlpTrackerAddress,
        feeQlpTrackerAddress,
    ];

    const { data: walletBalances } = useSWR(
        [
            `Stake:walletBalances:${active}`,
            chainId,
            readerAddress,
            "getTokenBalancesWithSupplies",
            account || PLACEHOLDER_ACCOUNT,
        ],
        {
            fetcher: fetcher(library, Reader, [walletTokens]),
        }
    );

    const { data: depositBalances } = useSWR(
        [
            `Stake:depositBalances:${active}`,
            chainId,
            rewardReaderAddress,
            "getDepositBalances",
            account || PLACEHOLDER_ACCOUNT,
        ],
        {
            fetcher: fetcher(library, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
        }
    );

    const { data: stakingInfo } = useSWR(
        [`Stake:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT],
        {
            fetcher: fetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
        }
    );

    const { data: aums } = useSWR([`Stake:getAums:${active}`, chainId, qlpManagerAddress, "getAums"], {
        fetcher: fetcher(library, QlpManager),
    });

    const { data: nativeTokenPrice } = useSWR(
        [`Stake:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
        {
            fetcher: fetcher(library, Vault),
        }
    );


    let aum;
    if (aums && aums.length > 0) {
        aum = aums[0].add(aums[1]).div(2);
    }

    const { balanceData, supplyData } = getBalanceAndSupplyData(walletBalances);
    const depositBalanceData = getDepositBalanceData(depositBalances);
    const stakingData = getStakingData(stakingInfo);
    const processedData = getProcessedData(
        balanceData,
        supplyData,
        depositBalanceData,
        stakingData,
        aum,
        nativeTokenPrice,
    );

    let totalRewardTokensAndQlp;
    if (processedData && processedData.qlpBalance) {
        totalRewardTokensAndQlp = processedData.qlpBalance;
    }


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    let earnMsg;
    let isClaimable = false;
    if (totalRewardTokensAndQlp && totalRewardTokensAndQlp.gt(0)) {

        let qlpStr;
        if (processedData.qlpBalance && processedData.qlpBalance.gt(0)) {
            qlpStr = formatAmount(processedData.qlpBalance, 18, 2, true) + " QLP";
            isClaimable = true;
        }
        const amountStr = [qlpStr].filter((s) => s).join(", ");
        earnMsg = (
            <div>
                You earn {nativeTokenSymbol} rewards with {formatAmount(totalRewardTokensAndQlp, 18, 2, true)} tokens.
                <br />
                Tokens: {amountStr}.
            </div>
        );
    }

    return (
        <div>
            <CompoundModal
                setPendingTxns={setPendingTxns}
                isVisible={isCompoundModalVisible}
                setIsVisible={setIsCompoundModalVisible}
                rewardRouterAddress={rewardRouterAddress}
                wrappedTokenSymbol={wrappedTokenSymbol}
                nativeTokenSymbol={nativeTokenSymbol}
                library={library}
                chainId={chainId}
            />
            <ClaimModal
                active={active}
                account={account}
                setPendingTxns={setPendingTxns}
                isVisible={isClaimModalVisible}
                setIsVisible={setIsClaimModalVisible}
                rewardRouterAddress={rewardRouterAddress}
                totalVesterRewards={processedData.totalVesterRewards}
                wrappedTokenSymbol={wrappedTokenSymbol}
                nativeTokenSymbol={nativeTokenSymbol}
                library={library}
                chainId={chainId}
            />
            <div className="Stake-cards">
                <div className="Stake-card-title">
                    <div className="Stake-card-title-mark">Earned</div>
                    <div className="Stake-card-title-mark-label">
                        {formatKeyAmount(processedData, "feeQlpTrackerRewards", 18, 2, true)}{'\u00A0'}
                        {wrappedTokenSymbol}{'\u00A0'}
                        ($
                        {formatKeyAmount(processedData, "feeQlpTrackerRewardsUsd", USD_DECIMALS, 2, true)})
                    </div>
                </div>
                <div className="Stake-card-action">
                    {active && isClaimable && (
                        <button
                            style={{ background: "#448AFF" }}
                            className="Stake-card-option"
                            onClick={() => setIsCompoundModalVisible(true)}
                        >
                            Compound
                        </button>
                    )}
                    {(!active || !isClaimable) && (
                        <button
                            style={{ background: "#3E4252" }}
                            className="Stake-card-option"
                            disabled
                            onClick={() => setIsCompoundModalVisible(true)}
                        >
                            Compound
                        </button>
                    )}

                    {active && isClaimable && (
                        <button
                            style={{ background: "#448AFF3D" }}
                            className="Stake-card-option"
                            onClick={() => setIsClaimModalVisible(true)}
                        >
                            Claim
                        </button>
                    )}
                    {(!active || !isClaimable) && (
                        <button
                            style={{ background: "#3E4252" }}
                            className="Stake-card-option"
                            disabled
                            onClick={() => setIsClaimModalVisible(true)}
                        >
                            Claim
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}