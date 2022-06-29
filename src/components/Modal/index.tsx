import React from "react";
import { useSpring, useTransition } from "react-spring";
import { isMobile } from "react-device-detect";
import { useGesture } from "react-use-gesture";
import { StyledDialogContent, StyledDialogOverlay } from "./styled";

interface ModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    minHeight?: number | false;
    maxHeight?: number;
    initialFocusRef?: React.RefObject<any>;
    dangerouslyBypassFocusLock?: boolean;
    children?: React.ReactNode;
    onHide?: () => void;
    fitContent?: boolean;
}

export default function Modal({ isOpen, onDismiss, minHeight = false, maxHeight = 90, initialFocusRef, dangerouslyBypassFocusLock, children, fitContent, onHide }: ModalProps) {
    const fadeTransition = useTransition(isOpen, null, {
        config: { duration: 200 },
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });

    const [{ y }, set] = useSpring(() => ({
        y: 0,
        config: { mass: 1, tension: 210, friction: 20 },
    }));
    const bind = useGesture({
        onDrag: (state) => {
            set({
                y: state.down ? state.movement[1] : 0,
            });
            if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
                onDismiss();
            }
        },
    });

    return (
        <>
            {fadeTransition.map(
                ({ item, key, props }) =>
                    item && (
                        <StyledDialogOverlay
                            key={key}
                            style={props}
                            onDismiss={onDismiss}
                            initialFocusRef={initialFocusRef}
                            dangerouslyBypassFocusLock={dangerouslyBypassFocusLock}
                            unstable_lockFocusAcrossFrames={false}
                            onClick={onHide}
                        >
                            <StyledDialogContent
                                {...(isMobile
                                    ? {
                                          ...bind(),
                                          style: { transform: `translateY(-3rem)` },
                                      }
                                    : {
                                          style: { width: fitContent ? "unset" : "700px" },
                                      })}
                                aria-label="dialog content"
                                minHeight={minHeight}
                                maxHeight={maxHeight}
                                mobile={isMobile}
                            >
                                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                                {children}
                            </StyledDialogContent>
                        </StyledDialogOverlay>
                    )
            )}
        </>
    );
}
