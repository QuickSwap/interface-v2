import { darken } from 'polished'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

export const DesktopHeader = styled.div`
  display: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px;

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    align-items: center;
    display: grid;
    grid-template-columns: 1fr 1fr;
    & > div:last-child {
      text-align: right;
      margin-right: 12px;
    }
  }
`
export const MobileHeader = styled.div`
  font-size: 16px;
  font-weight: 500;
  padding: 8px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: none;
  }
`

export const OldFarmingWarning = styled.div`
  background-color: #46210a;
  border: 1px solid #861f1f;
  border-radius: 8px;
  align-items: center;

  a {
    padding: 8px;
    background: white;
    border-radius: 6px;
    width: 230px;
    margin-left: auto;

    &:hover {
      background-color: ${darken(0.1, 'white')}
    }
  }

  span {
    margin-left: 0.5rem;
  }

  ${({theme}) => theme.mediaWidth.upToMedium`

  align-items: flex-start;
  flex-direction: column;

  span {
    line-height: 24px;
    margin-left: 0;
    margin-top: 0.5rem;
  }

  a {
    margin-left: 0;
    margin-top: 0.5rem;
  }
`}

`
