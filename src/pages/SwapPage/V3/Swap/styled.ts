import styled from 'styled-components/macro'
import { Info } from 'react-feather'
import IphoneBanner from '../../assets/images/iphone-contest.png'
import IphoneBannerMobile from '../../assets/images/iphone-contest-mobile.png'
import BannerIMG from '../../assets/images/coins.png'
import AppBody from '../AppBody'
import { Link } from "react-router-dom"
import { darken } from "polished"

export const StyledInfo = styled(Info)`
    opacity: 0.6;
    color: #2f567b;
    height: 16px;
    width: 16px;

    :hover {
        opacity: 0.8;
    }
`

export const ContestBanner = styled.a`
    display: flex;
    color: white;
    background-image: url(${IphoneBanner});
    width: 100%;
    height: 64px;
    text-decoration: none;
    background-size: cover;

    ${({ theme }) => theme.mediaWidth.upToSmall`
        top: -5rem;
        background-image: url(${IphoneBannerMobile});
        background-size: contain;
        background-repeat: no-repeat;
  `}

`
export const ContestIMG = styled.div`
    position: absolute;
    top: -14px;
    background-image: url(${BannerIMG});
    width: 114px;
    height: 89px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
`}
`

export const ContestBannerTitle = styled.div`
    display: flex;
    align-items: center;
    font-size: 20px;
    text-transform: uppercase;
    font-weight: 600;
    margin-left: 10rem;
    margin-top: 1rem;
    margin-right: 2rem;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
`}
`

export const ContestBannerTitleIphone = styled.span`
    color: #F4BE32;
`

export const ContestButton = styled(Link)`
    
    background: #3D8DF8;
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    color: white;
    font-weight: 600;
    margin-left: auto;
    font-size: 14px;
    text-decoration: none;
    text-transform: none;

    &:hover {
        background: ${darken(0.08, '#3D8DF8')}
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
        display: none;
    `}
`

export const WrappedAppBody = styled(AppBody)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
        margin-top: 6rem;
    `}
`
