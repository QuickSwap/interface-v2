import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import QlpSwap from "../../components/Qlp/QlpSwap";
import Footer from "../../Footer";
import "./BuyQlp.css";

import { useChainId } from "../../Helpers";
import { getNativeToken } from "../../data/Tokens";

export default function BuyQlp(props) {
  const { chainId } = useChainId();
  const history = useHistory();
  const [isBuying, setIsBuying] = useState(true);
  const nativeTokenSymbol = getNativeToken(chainId).symbol;

  useEffect(() => {
    const hash = history.location.hash.replace("#", "");
    const buying = hash === "redeem" ? false : true;
    setIsBuying(buying);
  }, [history.location.hash]);

  return (
    <div className="default-container buy-qlp-content page-layout"
      style={{zIndex:"10"}}
    >
          <div className="section-title-content mb-3">
          <div className="Page-title">+/- Liquidity</div>
          <div className="Page-description">
            Add liquidity and get tokens to earn fees from swaps and leverage trading in {nativeTokenSymbol}.
          </div>
        </div>
      <QlpSwap {...props} isBuying={isBuying} setIsBuying={setIsBuying} />
      <Footer />
    </div>
  );
}
