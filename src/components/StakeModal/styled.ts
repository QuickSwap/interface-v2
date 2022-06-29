import styled, { css } from 'styled-components/macro'
import { darken } from 'polished'
import gradient from 'random-gradient'
import { skeletonGradient } from '../../theme/styles/skeleton'
import { Link } from 'react-router-dom'

export const ModalWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
    color: #080064;
`
export const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1rem;
`
export const CloseModalButton = styled.button`
    background: transparent;
    border: none;
`
export const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 400px;
    max-height: 400px;
    overflow: auto;
`
export const NFTPositionsRow = styled.div`
    width: 100%;
    margin-bottom: 8px;
`
export const NFTPosition = styled.div<{ selected?: boolean; skeleton?: boolean }>`
    display: inline-flex;
    cursor: pointer;
    position: relative;
    width: calc(33% - 8px);
    border-radius: 1rem;
    border: 1px solid ${({ selected }) => (selected ? '#3970FF' : 'rgba(60, 97, 126, 0.5)')};
    padding: 8px;
    margin-right: 9px;
    transition-duration: 0.2s;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    width: calc(50% - 5px);
    margin-bottom: 5px;
    &:nth-of-type(2n) {
      margin-right: 0;
    }
  `}
`
export const NFTPositionSelectCircle = styled.div<{ selected?: boolean; skeleton?: boolean }>`
    position: absolute;
    width: 20px;
    height: 20px;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition-duration: .2s;
    border: 1px solid ${({ selected }) => (selected ? '#3970FF' : 'rgba(60, 97, 126, 0.5)')};
    background-color: ${({ selected }) => (selected ? '#3970FF' : 'transparent')}
`
export const NFTPositionIcon = styled.div<{ skeleton?: boolean; name?: string }>`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    border-radius: 50%;
    background: ${({ name }) => (name ? gradient('token' + name) : '')};
    ${({ skeleton }) =>
        skeleton &&
        css`
            background: rgba(60, 97, 126, 0.5);
            ${skeletonGradient}
        `};
`
export const NFTPositionDescription = styled.div<{ skeleton?: boolean }>`
    margin-left: 10px;
    line-height: 22px;

    ${({ skeleton }) =>
        skeleton &&
        css`
            & > * {
                background: rgba(60, 97, 126, 0.5);
                border-radius: 6px;
                ${skeletonGradient}
            }

            & > ${NFTPositionIndex} {
                height: 18px;
                width: 40px;
                margin-bottom: 3px;
                margin-top: 2px;
            }

            & > ${NFTPositionLink} {
                height: 13px;
                width: 60px;
                display: inline-block;
            }
        `}
`
export const NFTPositionIndex = styled.div<{ skeleton?: boolean }>``
export const NFTPositionLink = styled.a<{ skeleton?: boolean }>`
    font-size: 13px;
`
export const StakeButton = styled.button`
    background: ${({ theme }) => theme.winterMainButton};
    border: none;
    padding: 1rem;
    font-weight: 600;
    color: white;
    border-radius: 8px;
    width: 100%;

    &:first-of-type {
        margin-right: 1rem;
    }

    &:hover {
        background: ${({ theme }) => darken(0.05, theme.winterMainButton)};
    }

    &:disabled {
        background: ${({ theme }) => theme.winterDisabledButton};
        cursor: default;
    }
`
export const StakeButtonLoader = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
`
export const EmptyMock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 350px;
    align-items: center;
    justify-content: center;
`
export const LoaderMock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 487px;
    align-items: center;
    justify-content: center;
`
export const ProvideLiquidityLink = styled(Link)`
    display: flex;
    justify-content: center;
    text-decoration: none;
    background: linear-gradient(90deg, rgba(72, 41, 187, 1) 0%, rgb(49, 149, 255) 100%);
    padding: 8px 10px;
    border-radius: 6px;
    color: white;
    font-weight: 500;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 15px;
  `}
`
