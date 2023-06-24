import { Menu } from "@headlessui/react";
import { HiDotsHorizontal } from "react-icons/hi";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSelectMultiple } from "react-icons/bi";
import { RiShareBoxFill } from "react-icons/ri";
import "./PositionDropdown.css";

function PositionDropdown({ handleEditCollateral, handleShare, handleMarketSelect }) {
  return (
    <Menu>
      <Menu.Button as="div">
        <button className="PositionDropdown-dots-icon">
          <HiDotsHorizontal fontSize={20} fontWeight={700}/>
        </button>
      </Menu.Button>
      <div className="PositionDropdown-extra-options">
        <Menu.Items as="div" className="menu-items">
          <Menu.Item>
            <div className="menu-item" onClick={handleEditCollateral}>
              <p>Edit Collateral</p>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div className="menu-item" onClick={handleMarketSelect}>
              <p>Select Market</p>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div className="menu-item" onClick={handleShare}>
              <p style={{ border: "none" }}>Share Position</p>
            </div>
          </Menu.Item>
        </Menu.Items>
      </div>
    </Menu>
  );
}

export default PositionDropdown;
