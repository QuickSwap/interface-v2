import "./AddressDropdown.css";
import { Menu } from "@headlessui/react";
import { Link } from "react-router-dom";
import { helperToast, shortenAddress, useENS } from "../../Helpers";
import { useCopyToClipboard, createBreakpoint } from "react-use";
import viewInExplorerIcon from "../../assets/icons/viewInExplorerIcon.svg";
import copy from "../../assets/icons/copyIcon.svg";
import settings from "../../assets/icons/settingsIcon.svg";
import transferAccount from "../../assets/icons/transferAccountIcon.svg";
import disconnect from "../../assets/icons/disconnectIcon.svg";
import { FaChevronDown } from "react-icons/fa";
import Davatar from "@davatar/react";
import Jazzicon, * as reactJazzicon from 'react-jazzicon'

function AddressDropdown({ account, accountUrl, disconnectAccountAndCloseSettings, openSettings }) {
  const useBreakpoint = createBreakpoint({ L: 600, M: 550, S: 400 });
  const breakpoint = useBreakpoint();
  const [, copyToClipboard] = useCopyToClipboard();
  const { ensName } = useENS(account);
  const diameter = 24;

  return (
    <Menu>
      <Menu.Button as="div">
        <button className="App-cta small transparent address-btn">
          <span className="user-address">{ensName || shortenAddress(account, breakpoint === "S" ? 9 : 13)}</span>
          {/* <FaChevronDown/> */}
          <Jazzicon diameter={diameter} seed={reactJazzicon.jsNumberForAddress(account)}/>
        </button>
      </Menu.Button>
      <div>
        <Menu.Items as="div" className="menu-items">
          <Menu.Item>
            <div
              className="menu-item"
              onClick={() => {
                copyToClipboard(account);
                helperToast.success("Address copied to your clipboard");
              }}
            >
              <img src={copy} alt="Copy user address" />
              <p>Copy Address</p>
            </div>
          </Menu.Item>
          <Menu.Item>
            <a href={accountUrl} target="_blank" rel="noopener noreferrer" className="menu-item">
              <img src={viewInExplorerIcon} alt="Open address in explorer" />
              <p>View in Explorer</p>
            </a>
          </Menu.Item>

          <Menu.Item>
            <div className="menu-item" onClick={openSettings}>
              <img src={settings} alt="Open settings" />
              <p>Settings</p>
            </div>
          </Menu.Item>
          <Menu.Item>
            <Link to="/begin_account_transfer" className="menu-item">
              <img src={transferAccount} alt="Transfer your account" />
              <p>Transfer Account</p>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <div className="menu-item" onClick={disconnectAccountAndCloseSettings}>
              <img src={disconnect} alt="Disconnect the wallet" />
              <p className="no-border">Disconnect</p>
            </div>
          </Menu.Item>
        </Menu.Items>
      </div>
    </Menu>
  );
}

export default AddressDropdown;
