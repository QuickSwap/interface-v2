import { animated } from "react-spring";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import styled, { css } from "styled-components/macro";
import { transparentize } from "polished";
import React from "react";

const AnimatedDialogOverlay = animated(DialogOverlay);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
    &[data-reach-dialog-overlay] {
        z-index: 99;
        background-color: transparent;
        overflow: hidden;

        display: flex;
        align-items: center;
        justify-content: center;

        background-color: ${({ theme }) => theme.modalBG};
    }
`;

const AnimatedDialogContent = animated(DialogContent);
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => <AnimatedDialogContent {...rest} />).attrs({
    "aria-label": "dialog",
})`
    overflow-y: auto;

    &[data-reach-dialog-content] {
        margin: 0 0 2rem 0;
        background-color: #1c2a359e;
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
        box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
        width: 60vw;
        overflow-y: clip;
        overflow-x: hidden;
        padding: 1rem;

        align-self: ${({ mobile }) => (mobile ? "flex-end" : "center")};

        max-width: 750px;
        ${({ maxHeight }) =>
            maxHeight &&
            css`
                max-height: ${maxHeight}vh;
            `}
        ${({ minHeight }) =>
            minHeight &&
            css`
                min-height: ${minHeight}vh;
            `}
        display: flex;
        border-radius: 20px;
        ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
        ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${
          mobile &&
          css`
              width: 100vw;
              border-radius: 20px 20px 0 0;
              padding-bottom: 3rem;
              padding-top: 4rem;
              overflow-y: auto;
          `
      }
    `}
    }
`;
