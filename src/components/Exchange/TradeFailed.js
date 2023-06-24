import Modal from "../Modal/Modal";
import FailedIcon from "../../assets/icons/failed.svg";
import WarnIcon from "../../assets/icons/warn.svg";
import "./TradeFailed.css";
import { useModalContext } from "../../components/Modal/ModalProvider"
import { useEffect, useState } from "react";

export function TradeFailed() {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const { hideModal } = useModalContext();

    useEffect(() => {
        setIsModalVisible(true)
    }, []);

    return <Modal
    style={{ zIndex: 150}}
        className="trade-failed-modal"
        isVisible={isModalVisible}
        setIsVisible={hideModal}
        zIndex={950}
    >
        <img className="failed-img" src={FailedIcon} alt="" />
        <div className="text">
            <div className="warn">
                <img src={WarnIcon} alt="" height={20} />
                <span style={{ fontSize: "20px" }}>Trade failed.</span>
            </div>
            <span className="second">Please try again.</span>
        </div>
        <button className="btn-ok" onClick={hideModal}>Ok, Close</button>
    </Modal>;
}