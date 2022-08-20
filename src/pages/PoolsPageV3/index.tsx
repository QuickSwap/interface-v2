import { t, Trans } from "@lingui/macro";
import PositionList from "components/PositionList";
import { SwitchLocaleLink } from "components/SwitchLocaleLink";
import { useV3Positions } from "hooks/useV3Positions";
import { useActiveWeb3React } from "hooks/web3";
import { useCallback, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useWalletModalToggle } from "state/application/hooks";
import { useUserHideClosedPositions, useUserHideFarmingPositions } from "state/user/hooks";
import { Helmet } from "react-helmet";
import Loader from "../../components/Loader";
import FilterPanelItem from "./FilterPanelItem";
import { PositionPool } from "../../models/interfaces";
import Card from "../../shared/components/Card/Card";
import AutoColumn from "../../shared/components/AutoColumn";
import { SwapPoolTabs } from "../../components/NavigationTabs";
import "./index.scss";
import usePrevious, { usePreviousNonEmptyArray } from "../../hooks/usePrevious";
import { EthereumWindow } from "models/types";
import { useShowNewestPosition } from "state/mint/v3/hooks";
import { OldFarmingWarning } from "components/PositionList/styled";
import { AlertCircle } from "react-feather";

export default function Pool() {
    const { account, chainId } = useActiveWeb3React();
    const toggleWalletModal = useWalletModalToggle();

    const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions();
    const [hideFarmingPositions, setHideFarmingPositions] = useUserHideFarmingPositions();

    const { positions, loading: positionsLoading } = useV3Positions(account);

    const prevAccount = usePrevious(account);

    const [openPositions, closedPositions] = positions?.reduce<[PositionPool[], PositionPool[]]>(
        (acc, p) => {
            acc[p.liquidity?.isZero() ? 1 : 0].push(p);
            return acc;
        },
        [[], []]
    ) ?? [[], []];

    const filters = [
        {
            title: t`Closed`,
            method: setUserHideClosedPositions,
            checkValue: userHideClosedPositions,
        },
        {
            title: t`Farming`,
            method: setHideFarmingPositions,
            checkValue: hideFarmingPositions,
        },
    ];

    const farmingPositions = useMemo(() => positions?.filter((el) => el.onFarming), [positions, account, prevAccount]);
    const inRangeWithOutFarmingPositions = useMemo(() => openPositions.filter((el) => !el.onFarming), [openPositions, account, prevAccount]);

    const filteredPositions = useMemo(
        () => [...(hideFarmingPositions || !farmingPositions ? [] : farmingPositions), ...inRangeWithOutFarmingPositions, ...(userHideClosedPositions ? [] : closedPositions)],
        [inRangeWithOutFarmingPositions, userHideClosedPositions, hideFarmingPositions, account, prevAccount]
    );

    const prevFilteredPositions = usePreviousNonEmptyArray(filteredPositions);

    const _filteredPositions = useMemo(() => {
        if (account !== prevAccount) return filteredPositions;

        if (filteredPositions.length === 0 && prevFilteredPositions) {
            return prevFilteredPositions;
        }
        return filteredPositions;
    }, [filteredPositions, account, prevAccount]);

    const showNewestPosition = useShowNewestPosition();

    const newestPosition = useMemo(() => {
        return Math.max(..._filteredPositions.map((position) => +position.tokenId));
    }, [showNewestPosition, _filteredPositions]);

    const showConnectAWallet = Boolean(!account);

    let chainSymbol;

    if (chainId === 137) {
        chainSymbol = "MATIC";
    }

    const reload = useCallback(() => window.location.reload(), []);

    useEffect(() => {
        const _window = window as EthereumWindow;

        if (!_window.ethereum) return;

        _window.ethereum.on("accountsChanged", reload);
        return () => _window.ethereum.removeListener("accountsChanged", reload);
    }, []);

    return (
        <>
            <Helmet>
                <title>{t`Algebra — Pool`}</title>
            </Helmet>
            <Card classes={"br-24 ph-2 pv-1 mxs_ph-1"}>
                <SwapPoolTabs active={"pool"} />
                <AutoColumn gap="1">
                    <div className={"pool__header flex-s-between"}>
                        <span className={"fs-125"}>
                            <Trans>Pools Overview</Trans>
                        </span>
                        <div className={"flex-s-between mxs_mv-05"}>
                            <NavLink className={"btn primary p-05 br-8 mr-1"} id="join-pool-button" to={`/migrate`}>
                                <Trans>Migrate Pool</Trans>
                            </NavLink>
                            <NavLink className={"btn primary p-05 br-8"} id="join-pool-button" to={`/add`}>
                                + <Trans>New Position</Trans>
                            </NavLink>
                        </div>
                    </div>
                    {account && (
                        <div className={"f mb-05 rg-2 cg-2 mxs_f-jc"}>
                            {filters.map((item, key) => (
                                <FilterPanelItem item={item} key={key} />
                            ))}
                        </div>
                    )}
                    <main className={"f c f-ac"}>
                        <OldFarmingWarning className="f full-w p-1 mb-1">
                            <AlertCircle size={"24px"} />
                            <span>{t`Due to the audit's results, we’re currently updating our smart-contracts. Please, do not provide liquidity to our pools anytime soon.`}</span>
                        </OldFarmingWarning>
                        {positionsLoading ? (
                            <Loader style={{ margin: "auto" }} stroke="white" size={"2rem"} />
                        ) : _filteredPositions && _filteredPositions.length > 0 ? (
                            <PositionList positions={_filteredPositions.sort((posA, posB) => Number(+posA.tokenId < +posB.tokenId))} newestPosition={newestPosition} />
                        ) : (
                            <div className={"f c f-ac f-jc h-400 w-100 maw-300"}>
                                <Trans>You do not have any liquidity positions.</Trans>
                                {showConnectAWallet && (
                                    <button className={"btn primary pv-05 ph-1 mt-1 w-100"} onClick={toggleWalletModal}>
                                        <Trans>Connect Wallet</Trans>
                                    </button>
                                )}
                            </div>
                        )}
                    </main>
                </AutoColumn>
            </Card>
            <SwitchLocaleLink />
        </>
    );
}
