import React, { useState, createContext, useContext } from "react";

const initalState = {
    showModal: () => { },
    hideModal: () => { },
    store: {}
};

const ModalContext = createContext(initalState);
export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModalContext must be used with in a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [store, setStore] = useState();
    const { modalProps } = store || {};

    const showModal = (modalProps = {}) => {
        console.log(modalProps)
        setStore({
            ...store,
            modalProps
        });
    };

    const hideModal = () => {
        setStore({
            ...store,
            modalProps: <></>
        });
    };

    const renderComponent = () => {
        return modalProps;
    };

    return (
        <ModalContext.Provider value={{ store, showModal, hideModal }}>
            {renderComponent()}
            {children}
        </ModalContext.Provider>
    );
};