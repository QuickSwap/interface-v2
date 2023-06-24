import React from "react";

import cx from "classnames";

import "./Checkbox.css";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import CustomCheckboxChecked from "./CustomCheckboxChecked";
import CustomCheckboxUnchecked from "./CustomCheckboxUnchecked";

export default function Checkbox(props) {
  const { isChecked, setIsChecked, disabled, className } = props;

  return (
    <div
      className={cx("Checkbox", { disabled, selected: isChecked }, className)}
      onClick={() => setIsChecked(!isChecked)}
    >
      <span className="Checkbox-icon-wrapper">
        {isChecked && <CustomCheckboxChecked />}
        {!isChecked && <CustomCheckboxUnchecked />}
      </span>
      <span className="Checkbox-label">{props.children}</span>
    </div>
  );
}
