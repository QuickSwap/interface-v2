import styled from 'styled-components/macro'
import { Box } from 'rebass/styled-components'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
    width: ${({ width }) => width ?? '100%'};
    padding: ${({ padding }) => padding ?? '1rem'};
    border-radius: ${({ $borderRadius }) => $borderRadius ?? '16px'};
    border: ${({ border }) => border};
`
export default Card

export const LightCard = styled(Card)`
    background-color: ${({}) => '#2f567b'};
    color: white;
`

export const LightGreyCard = styled(Card)`
    background-color: ${({}) => 'rgba(60, 97, 126, 0.5)'};
`

export const GreyCard = styled(Card)`
    background-color: ${({}) => 'rgba(60, 97, 126, 0.5)'};
`

export const DarkGreyCard = styled(Card)`
    background-color: ${({}) => 'rgba(60, 97, 126, 0.5)'};
`

export const DarkCard = styled(Card)`
    background-color: ${({}) => 'rgba(60, 97, 126, 0.5)'};
`

export const OutlineCard = styled(Card)`
        // border: 1px solid ${({ theme }) => theme.bg3};
    background-color: ${({}) => 'rgba(60, 97, 126, 0.5)'};
`

export const YellowCard = styled(Card)`
    background-color: rgba(243, 132, 30, 0.05);
    color: ${({ theme }) => theme.yellow1};
    font-weight: 500;
`

export const BlueCard = styled(Card)`
    background-color: ${({ theme }) => theme.primary5};
    color: ${({ theme }) => theme.blue1};
    border-radius: 12px;
`

export const GreyBadge = styled(Card)`
    width: fit-content;
    border-radius: 8px;
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text1};
    padding: 4px 6px;
    font-weight: 400;
`
