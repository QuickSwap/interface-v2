import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import Checkbox from "../../components/Checkbox/Checkbox";
import "./Disclaimer.css";

export default function Disclaimer(props) {
  const { isVisible, setIsVisible, sentMsg, failMsg, action } = props;
  const [isRead, setIsRead] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [isEnable, setIsEnable] = useState(false);

  useEffect(() => {
    if (isRead && isAgree) {
      setIsEnable(true);
    } else {
      setIsEnable(false);
    }
  }, [isAgree, isRead]);

  function closeAndAction() {
    setIsVisible(false);
    action(sentMsg, failMsg);
  }

  return (
    <div className=" PositionEditor">
      <Modal className=" Disclaimer" isVisible={isVisible} setIsVisible={setIsVisible} label="Disclaimer">
        <div className="Disclaimer-row">
          Please check the boxes below to confirm your agreement to the
          <br />
          <a
            href="https://docs.google.com/document/d/1Gglh43oxUZHdgrS2L9lZfsI4f6HYNF6MbBDsDPJVFkM"
            target="_blank"
            rel="noreferrer"
          >
            Quickswap Terms and Coinditions
          </a>
        </div>
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div className="Disclaimer-row">
            <Checkbox isChecked={isRead} setIsChecked={setIsRead} className="Disclaimer-checkbox">
              <span>
                I have read and understood, and do hereby agree to be legally bound as a 'user' under, the
                Terms,including all future amendments thereto. Such agreement is irrevocable and will apply to all of my
                uses of the Site without me providing confirmation in each specific instance.
              </span>
            </Checkbox>
          </div>
          <div className="Disclaimer-row">
            <Checkbox isChecked={isAgree} setIsChecked={setIsAgree} className="Disclaimer-checkbox">
              <span>
                I acknowledge and agree that the Site solely provides information about data on the applicable
                blockchains. I accept that the Site operators have no custody overmy funds, ability or duty to transact
                on my behalf or power to reverse my transactions. The Site operators do not endorse or provide any
                warranty with respect to any tokens.
              </span>
            </Checkbox>
          </div>
        </div>

        <button
          className="App-cta Exchange-swap-button"
          onClick={closeAndAction}
          style={{ fontSize: "16px", color: "#F5F6F8", fontWeight: "500" }}
          disabled={!isEnable}
        >
          Confirm
        </button>
      </Modal>
    </div>
  );
}
