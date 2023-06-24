import React from "react";
import { Menu } from "@headlessui/react";
import FaChevronDown from "../../img/drop_down.svg";
import cx from "classnames";
import "./ChartTokenSelector.css";
import { getTokens, getWhitelistedTokens } from "../../data/Tokens";
import { LONG, SHORT, SWAP } from "../../Helpers";
import { none } from "@cloudinary/url-gen/qualifiers/fontHinting";

export default function ChartTokenSelector(props) {
  const { chainId, selectedToken, onSelectToken, swapOption } = props;

  const isLong = swapOption === LONG;
  const isShort = swapOption === SHORT;
  const isSwap = swapOption === SWAP;

  let options = getTokens(chainId);
  const whitelistedTokens = getWhitelistedTokens(chainId);
  const indexTokens = whitelistedTokens.filter((token) => !token.isStable && !token.isWrapped);
  const shortableTokens = indexTokens.filter((token) => token.isShortable);

  if (isLong) {
    options = indexTokens;
  }
  if (isShort) {
    options = shortableTokens;
  }

  const onSelect = async (token) => {
    onSelectToken(token);
  };

  var value = selectedToken;

  return (
    <Menu>
      <Menu.Button as="div" disabled={isSwap}>
        <div className={cx("transparent chart-token-selector flex", { "default-cursor": isSwap })}>
          <span className="chart-token-selector--current">{value.symbol} / USD</span>
          {!isSwap && <img style={{ width: 16, height: 16, verticalAlign: none }} src={FaChevronDown} alt="chevron down" />}
        </div>
      </Menu.Button>
      <Menu.Items as="div" className="menu-items chart-token-menu-items">
        {options.map((option, index) => (
          <Menu.Item key={index}>
            <div
              className="menu-item chart-token-menu-item"
              onClick={() => {
                onSelect(option);
              }}
            >
              <span style={{ marginLeft: 5 }} className="token-label">
                {option.symbol} / USD
              </span>
            </div>
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
