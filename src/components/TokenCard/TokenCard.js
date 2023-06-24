import React, { useCallback } from "react";
import { Link } from "react-router-dom";

import RightArr from "../../assets/icons/RightArr";

import { POLYGON_ZKEVM, switchNetwork, useChainId } from "../../Helpers";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";

import { getImageUrl } from "../../cloudinary/getImageUrl";

export default function TokenCard() {
  const { chainId } = useChainId();
  const { active } = useWeb3React();

  const changeNetwork = useCallback(
    (network) => {
      if (network === chainId) {
        return;
      }
      if (!active) {
        setTimeout(() => {
          return switchNetwork(network, active);
        }, 500);
      } else {
        return switchNetwork(network, active);
      }
    },
    [chainId, active]
  );

  return (
    <div className="Home-token-card-options mb-180 ">
      <div className="Home-token-card-option borderradius token-card-flex ">
        <div style={{ display: "flex", flexDirection: "column" }} className="">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
            <img
              style={{ width: 100, height: 100, marginRight: 15 }}
              src={getImageUrl({
                path: "coins/qlp-original",
                format: "png",
              })}
              alt="qpxBigIcon"
            />{" "}
            <span className="text-bigger">QLP</span>
          </div>
          <div>
            <p className="token-card-paragraph">
              The platform's liquidity token, QLP, receives 70% of the fees collected.
            </p>
          </div>
        </div>
        <div className="Home-token-card-option-info">
          <div style={{ fontSize: 17, lineHeight: "28px", fontWeight: 600 }} className="Home-token-card-option-apr">
            <p style={{ opacity: "80%" }} className="token-apr">
              APR: <APRLabel chainId={POLYGON_ZKEVM} label="qlpAprTotal" key="POLYGON_ZKEVM" />
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 30 }}
              className="Home-token-card-option-action card-flex-2"
            >
              <div className="card-flex">
                <Link
                  style={{ background: "#ffaa27", color: "#000" }}
                  to="/liquidity"
                  className="buy-polygon2 basis-212"
                  onClick={() => changeNetwork(POLYGON_ZKEVM)}
                >
                  + LIQ.
                </Link>
                <Link
                  style={{
                    background: "#625df5",
                  }}
                  to="/liquidity#redeem"
                  className="buy-polygon basis-76 purple-hover"
                  onClick={() => changeNetwork(POLYGON_ZKEVM)}
                >
                  - LIQ.
                </Link>
              </div>

              <a href="https://perps-docs.quickswap.exchange/qlp" target="_blank" rel="noreferrer" className="btn-read-more">
                Read More <RightArr />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
