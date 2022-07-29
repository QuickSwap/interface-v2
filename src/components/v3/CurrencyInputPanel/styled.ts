import styled, { css } from 'styled-components/macro'
import { ButtonGray } from '../Button'
import { darken } from 'polished'
import { AutoColumn } from 'components/Column'
import { Input as NumericalInput } from '../NumericalInput'
// @ts-ignore
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

//index
export const InputPanel = styled.div<{ hideInput?: boolean }>`
    ${({ theme }) => theme.flexColumnNoWrap}
    position: relative;
    border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
        // background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
    background-color: transparent;
    z-index: 1;
    width: 100% !important;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%!important;
  `}
`
export const FixedContainer = styled.div`
    width: 100%;
    height: 60px;
    align-items: center;
    position: absolute;
    display: flex;
    justify-content: center;
    z-index: 2;
`
export const Container = styled.div<{ hideInput: boolean }>`
    border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
    background-color: transparent;
    width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`
export const CurrencySelect = styled(ButtonGray) <{ selected: boolean; hideInput?: boolean; page?: string; shallow: boolean; swap: boolean }>`
    align-items: center;
    font-size: 24px;
    font-weight: 500;
    background-color: var(--dark-ebony-clay);
    color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    border-radius: 16px;
    box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
    outline: none;
    cursor: pointer;
    user-select: none;
    border: none;
    height: ${({ hideInput }) => (hideInput ? '38px' : '35px')};
    width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
    min-width: 214px;
    padding: 0 15px;
    justify-content: space-between;
    margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};

    &:focus,
    &:hover {
        background-color: var(--mirage);
    }
    ${({ shallow }) =>
        shallow &&
        css`
            padding: 0;
            background-color: transparent;
            box-shadow: none;

            &:hover, &:focus {
                background-color: transparent;
                cursor: default;
            }
        `}
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`{
    width: 100%;
    margin: 0;
  }`}
`
export const InputRow = styled.div<{ selected: boolean; hideCurrency: boolean }>`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    padding: ${({ hideCurrency }) => (hideCurrency ? '1rem 1rem 0.75rem 0' : '1rem 1rem 0.75rem 1rem')};
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`{
    flex-direction: column;
    align-items: stretch;
  }`}
`
export const AutoColumnStyled = styled(AutoColumn) <{ page?: string }>`
    left: 1rem;
    bottom: -13% !important;
    ${({ theme, page }) => theme.mediaWidth.upToExtraSmall`
  left: ${page === 'addLiq' ? '0' : ''};
  bottom: -25% !important;
  `}
`
export const LabelRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    color: ${({ theme }) => theme.text1};
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 0 1rem 1rem;

    span:hover {
        cursor: pointer;
        color: ${({ theme }) => darken(0.2, theme.text2)};
    }
`
export const FiatRow = styled(LabelRow) <{ shallow?: boolean; page: string | undefined }>`
    justify-content: flex-end;
    padding: ${({ shallow, page }) => (page === 'addLiq' ? '0 1rem' : shallow ? '0' : '0 1rem 1rem')};
    margin-top: ${({ page }) => (page === 'pool' ? '.3rem' : '0')};

    span {
        &:hover {
            color: white;
            cursor: default;
        }
    }

`
export const Aligner = styled.span<{ centered: boolean }>`
    display: flex;
    align-items: center;
    justify-content: ${({ centered }) => (centered ? 'center' : 'space-between')};
    width: 100%;
    position: relative;
`
export const NumericalInputStyled = styled(NumericalInput)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 18px!important;
  `}
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`{
    text-align: left!important;
    width: 100%;
    margin: 15px 0 10px!important;
  }`}
`
export const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
    margin: 0 0.25rem 0 0.35rem;
    height: 35%;

    path {
        stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
        stroke-width: 1.5px;
    }
`
export const StyledTokenName = styled.span<{ active?: boolean }>`
    ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
    font-size: ${({ active }) => (active ? '16px' : '16px')};
`
export const MaxButton = styled.button<{ page: string | undefined }>`
    background-color: ${({ page, theme }) => page === 'addLiq' ? 'var(--primary)' : 'var(--primary-weak)'};
    border-radius: 6px;
    color: white;
    margin-right: 10px;
    border: none;
    padding: 4px 6px;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 10px 0 0 0;
  `}
    &:hover {
        background-color: ${({
    page,
    theme
}) => page === 'addLiq' ? darken(0.05, theme.winterMainButton) : darken(0.05, '#245376')};
    }

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      width: 100%;
      margin-top: 10px;
      margin-right: 0;
  `}
`
