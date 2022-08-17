import styled from 'styled-components/macro'
import { RowBetween, RowFixed } from '../Row'

export const RowBetweenHeader = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
    align-items: start;
  `}
`
export const RowFixedStyled = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     margin-bottom: 10px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
     margin-left: 12px;
  `}
`
