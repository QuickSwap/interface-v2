import { useEffect } from "react";

export default function SellQlp(props) {
  useEffect(() => {
    window.location.href = "#/liquidity#redeem";
  }, []);
  return <div className="Page page-layout"></div>;
}
