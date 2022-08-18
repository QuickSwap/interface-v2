import { t } from "@lingui/macro";
import Loader from "components/Loader";
import { ReactElement } from "react";
import "./index.scss";

interface IPoolStats {
    fee: string | ReactElement;
    apr: string | ReactElement | undefined;
    noLiquidity: boolean | undefined;
    loading: boolean;
}

export function PoolStats({ fee, apr, noLiquidity, loading }: IPoolStats) {
    if (loading)
        return (
            <div className="pool-stats-wrapper f f-ac f-jc w-100" style={{ padding: "0.5rem 1rem" }}>
                <Loader stroke={"white"} />
            </div>
        );

    return (
        <div className="pool-stats-wrapper f f-jb mxs_fd-c w-100">
            <div className="pool-stats__title f w-100">{noLiquidity ? t`New pool` : t`Current pool stats`}</div>
            <div className="f">
                <div className={`pool-stats__fee single`}>
                    <span>{fee}</span>
                </div>
                {/* {apr && (
                    <div className="pool-stats__apr">
                        <span>{apr}</span>
                    </div>
                )} */}
            </div>
        </div>
    );
}
