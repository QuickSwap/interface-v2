import styled from 'styled-components/macro'
import { AutoColumn, ColumnCenter } from '../Column'

export const Wrapper = styled.div`
  width: 100%;
  padding: 1rem;
`
export const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '0' : '0')};
`
export const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`
export const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '60px 0;')};
`
export const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`
