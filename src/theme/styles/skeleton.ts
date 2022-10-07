import { css, keyframes } from 'styled-components/macro';

export const skeletonAnimation = keyframes`
  100% {
    transform: translateX(100%);
  }
`;
export const skeletonGradient = css`
  position: relative;
  overflow: hidden;
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      var(--dark-ebony-clay) 0,
      var(--primary-hover) 25%,
      var(--primary-weak) 60%,
      var(--dark-ebony-clay)
    );
    animation-name: ${skeletonAnimation};
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    content: '';
  }
`;
